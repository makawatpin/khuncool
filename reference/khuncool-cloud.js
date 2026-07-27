/* khuncool cloud — auth + cross-device sync (Supabase)
   ใช้ฟรีทั้งหมด · ไม่ล็อกอินก็ใช้ได้ (เก็บในเครื่อง) · ล็อกอินแล้วข้อมูลตามตัวไปทุกเครื่อง

   Exposes:
     window.KhuncoolCloud   – auth + sync API
     <khuncool-account>     – top-bar account button + login/signup sheet
*/
(function () {
  if (window.KhuncoolCloud) return;

  const SUPABASE_URL = 'https://segfdmnxbdctntvsdprq.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZ2ZkbW54YmRjdG50dnNkcHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjE5OTIsImV4cCI6MjEwMDUzNzk5Mn0.OD2PXqcbUfNZkCYsOVwshueXpC4-jIQPgZUN_6E5HYY';
  const TABLE = 'kc_state';
  const PREFIX = 'khuncool';   // ครอบทั้ง khuncool.* และ khuncool_*
  const LOCAL_STAMP = 'khuncool.__syncedAt';

  const listeners = new Set();
  const S = {
    ready: false,
    user: null,
    status: 'local',       // local | signing | online | syncing | error | offline
    message: '',
    lastSync: null,
    client: null,
  };

  function emit() { listeners.forEach(fn => { try { fn(snapshot()); } catch (e) {} }); }
  function snapshot() {
    const m = (S.user && S.user.user_metadata) || {};
    return {
      ready: S.ready,
      signedIn: !!S.user,
      email: S.user ? S.user.email : '',
      fullName: m.full_name || '',
      school: m.school || '',
      status: S.status,
      message: S.message,
      lastSync: S.lastSync,
    };
  }
  function setStatus(status, message) { S.status = status; S.message = message || ''; emit(); }

  /* ---------- local state bag ---------- */
  function collectLocal() {
    const bag = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(PREFIX) === 0 && k !== LOCAL_STAMP && k !== 'khuncool-auth') bag[k] = localStorage.getItem(k);
    }
    return bag;
  }
  function applyLocal(bag) {
    if (!bag) return;
    Object.keys(bag).forEach(k => {
      if (k.indexOf(PREFIX) !== 0 || k === LOCAL_STAMP || k === 'khuncool-auth') return;
      try { localStorage.setItem(k, bag[k]); } catch (e) {}
    });
  }

  /* ---------- supabase client (lazy) ---------- */
  let clientPromise = null;
  function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = import('https://esm.sh/@supabase/supabase-js@2.45.4')
      .then(mod => {
        S.client = mod.createClient(SUPABASE_URL, SUPABASE_ANON, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'khuncool-auth' },
        });
        S.client.auth.onAuthStateChange((_evt, session) => {
          const next = session ? session.user : null;
          const changed = (next && next.id) !== (S.user && S.user.id);
          S.user = next;
          if (changed) {
            if (next) { setStatus('online'); pull(); }
            else setStatus('local', 'ใช้งานแบบเก็บในเครื่อง');
          } else emit();
        });
        return S.client;
      })
      .catch(err => {
        clientPromise = null;
        setStatus('offline', 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ยังใช้งานแบบเก็บในเครื่องได้ปกติ');
        throw err;
      });
    return clientPromise;
  }

  /* ---------- sync ---------- */
  let pushTimer = null;
  async function push(force) {
    if (!S.user) return;
    try {
      const c = await getClient();
      setStatus('syncing', 'กำลังบันทึกขึ้นคลาวด์…');
      const { error } = await c.from(TABLE).upsert({
        user_id: S.user.id,
        data: collectLocal(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) throw error;
      S.lastSync = Date.now();
      try { localStorage.setItem(LOCAL_STAMP, String(S.lastSync)); } catch (e) {}
      setStatus('online', 'ซิงก์แล้ว');
    } catch (e) {
      setStatus('error', 'บันทึกขึ้นคลาวด์ไม่สำเร็จ (ข้อมูลยังอยู่ในเครื่อง)');
    }
  }
  function schedulePush() {
    if (!S.user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => push(), 1200);
  }

  async function pull(opts) {
    if (!S.user) return null;
    const mode = (opts && opts.mode) || 'auto'; // auto | cloud | localWins
    try {
      const c = await getClient();
      setStatus('syncing', 'กำลังดึงข้อมูลของคุณ…');
      const { data, error } = await c.from(TABLE).select('data,updated_at').eq('user_id', S.user.id).maybeSingle();
      if (error) throw error;
      const cloudBag = data && data.data;
      const localBag = collectLocal();
      const hasCloud = cloudBag && Object.keys(cloudBag).length;
      const hasLocal = Object.keys(localBag).length;

      if (mode === 'localWins' || (!hasCloud && hasLocal)) { await push(); return 'pushed'; }
      if (hasCloud && (mode === 'cloud' || !hasLocal)) { applyLocal(cloudBag); S.lastSync = Date.now(); setStatus('online', 'ดึงข้อมูลจากคลาวด์แล้ว'); return 'pulled'; }
      if (hasCloud && hasLocal) {
        const cloudAt = data.updated_at ? Date.parse(data.updated_at) : 0;
        const localAt = parseInt(localStorage.getItem(LOCAL_STAMP) || '0', 10);
        if (cloudAt > localAt) { applyLocal(cloudBag); S.lastSync = Date.now(); setStatus('online', 'ดึงข้อมูลล่าสุดจากคลาวด์แล้ว'); return 'pulled'; }
        await push(); return 'pushed';
      }
      setStatus('online', 'พร้อมใช้งาน');
      return 'none';
    } catch (e) {
      setStatus('error', 'ดึงข้อมูลไม่สำเร็จ — ใช้ข้อมูลในเครื่องต่อได้');
      return null;
    }
  }

  /* ---------- patch localStorage so ทุกแอปเดิม sync ได้เอง ---------- */
  const rawSet = localStorage.setItem.bind(localStorage);
  const rawRemove = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = function (k, v) { rawSet(k, v); if (typeof k === 'string' && k.indexOf(PREFIX) === 0 && k !== LOCAL_STAMP && k !== 'khuncool-auth') schedulePush(); };
  localStorage.removeItem = function (k) { rawRemove(k); if (typeof k === 'string' && k.indexOf(PREFIX) === 0) schedulePush(); };

  /* ---------- auth API ---------- */
  const API = {
    get state() { return snapshot(); },
    onChange(fn) { listeners.add(fn); fn(snapshot()); return () => listeners.delete(fn); },
    async init() {
      try {
        const c = await getClient();
        const { data } = await c.auth.getSession();
        S.user = data && data.session ? data.session.user : null;
        S.ready = true;
        if (S.user) { setStatus('online'); await pull(); }
        else setStatus('local', 'ใช้งานแบบเก็บในเครื่อง');
      } catch (e) { S.ready = true; emit(); }
    },
    async signUp(email, password, meta) {
      const c = await getClient();
      setStatus('signing', 'กำลังสมัคร…');
      const { data, error } = await c.auth.signUp({
        email, password,
        options: { data: { full_name: (meta && meta.fullName) || '', school: (meta && meta.school) || '' } },
      });
      if (error) { setStatus('error', translate(error.message)); return { ok: false, error: translate(error.message) }; }
      if (data.session) { S.user = data.session.user; setStatus('online'); await pull({ mode: 'localWins' }); return { ok: true }; }
      setStatus('local', 'ส่งลิงก์ยืนยันไปที่อีเมลแล้ว — กดยืนยันแล้วเข้าสู่ระบบได้เลย');
      return { ok: true, confirm: true };
    },
    async signIn(email, password) {
      const c = await getClient();
      setStatus('signing', 'กำลังเข้าสู่ระบบ…');
      const { data, error } = await c.auth.signInWithPassword({ email, password });
      if (error) { setStatus('error', translate(error.message)); return { ok: false, error: translate(error.message) }; }
      S.user = data.user; setStatus('online'); await pull();
      return { ok: true };
    },
    async signInGoogle() {
      const c = await getClient();
      setStatus('signing', 'กำลังไปหน้า Google…');
      const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href } });
      if (error) setStatus('error', translate(error.message));
    },
    async resetPassword(email) {
      const c = await getClient();
      const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: location.href });
      if (error) return { ok: false, error: translate(error.message) };
      setStatus(S.user ? 'online' : 'local', 'ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว');
      return { ok: true };
    },
    async updateProfile(meta) {
      const c = await getClient();
      const { data, error } = await c.auth.updateUser({ data: { full_name: meta.fullName || '', school: meta.school || '' } });
      if (error) return { ok: false, error: translate(error.message) };
      S.user = data.user; emit();
      return { ok: true };
    },
    async signOut(keepLocal) {
      if (S.user) await push();
      const c = await getClient();
      await c.auth.signOut();
      S.user = null;
      if (!keepLocal) {
        Object.keys(collectLocal()).forEach(k => rawRemove(k));
        rawRemove(LOCAL_STAMP);
      }
      setStatus('local', 'ออกจากระบบแล้ว');
    },
    syncNow() { return S.user ? pull() : Promise.resolve(null); },
    pushNow() { return push(true); },
    pullCloud() { return pull({ mode: 'cloud' }); },
    pushLocal() { return pull({ mode: 'localWins' }); },
  };

  function translate(msg) {
    const m = (msg || '').toLowerCase();
    if (m.includes('invalid login')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    if (m.includes('already registered') || m.includes('already been registered')) return 'อีเมลนี้สมัครไว้แล้ว — ลองเข้าสู่ระบบ';
    if (m.includes('password should be at least')) return 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร';
    if (m.includes('email not confirmed')) return 'ยังไม่ยืนยันอีเมล — เช็กกล่องจดหมายก่อนนะ';
    if (m.includes('unable to validate email') || m.includes('invalid email')) return 'รูปแบบอีเมลไม่ถูกต้อง';
    if (m.includes('rate limit') || m.includes('too many')) return 'ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่';
    if (m.includes('provider is not enabled')) return 'ยังไม่ได้เปิด Google login ใน Supabase (ใช้อีเมล+รหัสผ่านได้เลย)';
    return msg || 'เกิดข้อผิดพลาด';
  }

  window.KhuncoolCloud = API;
  API.init();

  /* ================= <khuncool-account> ================= */
  const C = {
    ink: '#1A1D26', sub: '#5A6273', mute: '#A9B0BE', line: '#E5E8EE',
    tint: '#F8F9FB', indigo: '#5C5EE6', indigoD: '#4A46D6', indigoL: '#E1E3FD',
    teal: '#0A9380', tealL: '#D0FBEF', amber: '#C2500B', amberL: '#FFEAD5', red: '#D93B3B',
  };
  const FONT = "'Sarabun',system-ui,sans-serif";

  class KhuncoolAccount extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.st = { menu: false, sheet: false, tab: 'signin', email: '', pw: '', name: '', school: '', busy: false, err: '', note: '' };
      this._off = null;
    }
    connectedCallback() {
      this._off = API.onChange(s => { this.acc = s; this.render(); });
      this._onDoc = e => { if (!this.contains(e.target) && (this.st.menu)) { this.st.menu = false; this.render(); } };
      document.addEventListener('click', this._onDoc);
    }
    disconnectedCallback() { if (this._off) this._off(); document.removeEventListener('click', this._onDoc); }
    set(patch) { Object.assign(this.st, patch); this.render(); }

    async submit() {
      const { tab, email, pw, name, school } = this.st;
      if (!email || (tab !== 'reset' && !pw)) { this.set({ err: 'กรอกอีเมลและรหัสผ่านก่อนนะ' }); return; }
      this.set({ busy: true, err: '', note: '' });
      let r;
      if (tab === 'signup') r = await API.signUp(email, pw, { fullName: name, school });
      else if (tab === 'reset') r = await API.resetPassword(email);
      else r = await API.signIn(email, pw);
      if (!r || !r.ok) { this.set({ busy: false, err: (r && r.error) || 'ไม่สำเร็จ' }); return; }
      if (r.confirm) { this.set({ busy: false, note: 'ส่งลิงก์ยืนยันไปที่ ' + email + ' แล้ว — กดยืนยันในอีเมลแล้วกลับมาเข้าสู่ระบบ' }); return; }
      if (tab === 'reset') { this.set({ busy: false, note: 'ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว' }); return; }
      this.set({ busy: false, sheet: false, pw: '' });
    }

    render() {
      const a = this.acc || snapshot();
      const compact = this.hasAttribute('compact');
      const dot = a.signedIn ? (a.status === 'error' ? C.red : a.status === 'syncing' ? '#F59E0B' : C.teal) : C.mute;
      const initial = (a.fullName || a.email || '?').trim().charAt(0).toUpperCase();
      const statusText = !a.signedIn ? 'เก็บในเครื่องนี้' : a.status === 'syncing' ? 'กำลังซิงก์…' : a.status === 'error' ? 'ซิงก์ไม่สำเร็จ' : 'ซิงก์ทุกเครื่อง';

      this.shadowRoot.innerHTML = `
<style>
  :host{display:inline-block;position:relative;font-family:${FONT};color:${C.ink};line-height:1.5}
  *{box-sizing:border-box}
  button{font-family:inherit;cursor:pointer}
  .trigger{display:flex;align-items:center;gap:9px;padding:${compact ? '5px 6px 5px 5px' : '6px 12px 6px 6px'};border:1px solid ${C.line};border-radius:999px;background:#fff;transition:.15s}
  .trigger:hover{border-color:#C6C9FB;box-shadow:0 6px 16px -10px rgba(26,29,38,.3)}
  .avatar{width:32px;height:32px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;background:${a.signedIn ? 'linear-gradient(135deg,#5C5EE6,#14B79A)' : '#EAECF1'};${a.signedIn ? '' : `color:${C.sub}`}}
  .tlabel{display:flex;flex-direction:column;align-items:flex-start;gap:1px;${compact ? 'display:none' : ''}}
  .tname{font-size:13px;font-weight:600;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .tstat{display:flex;align-items:center;gap:5px;font-size:10.5px;color:${C.mute}}
  .dot{width:6px;height:6px;border-radius:50%;background:${dot}}
  .cta{border:none;border-radius:999px;background:${C.indigo};color:#fff;font-size:13px;font-weight:600;padding:9px 16px}
  .cta:hover{background:${C.indigoD}}

  .menu{position:absolute;top:calc(100% + 8px);right:0;width:282px;z-index:9000;background:#fff;border:1px solid ${C.line};border-radius:16px;padding:14px;box-shadow:0 24px 54px -18px rgba(26,29,38,.42)}
  .mhead{display:flex;gap:11px;align-items:center;padding-bottom:12px;border-bottom:1px solid ${C.line}}
  .mname{font-size:14px;font-weight:600}
  .mmail{font-size:11.5px;color:${C.mute};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
  .row{display:flex;align-items:center;gap:9px;width:100%;text-align:left;background:none;border:none;padding:9px 8px;border-radius:10px;font-size:13.5px;color:${C.ink}}
  .row:hover{background:${C.tint}}
  .row.danger{color:${C.red}}
  .badge{font-size:10.5px;font-weight:600;padding:3px 8px;border-radius:999px}
  .note{font-size:11.5px;color:${C.sub};background:${C.tint};border:1px solid ${C.line};border-radius:10px;padding:9px 10px;line-height:1.5;margin:12px 0 4px}

  .scrim{position:absolute;top:calc(100% + 8px);right:0;z-index:9600;display:block}
  .sheet{width:340px;max-height:min(78vh,620px);overflow:auto;background:#fff;border:1px solid #E5E8EE;border-radius:20px;padding:22px;box-shadow:0 30px 70px -20px rgba(26,29,38,.5)}
  .x{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:10px;border:1px solid ${C.line};background:#fff;font-size:14px;color:${C.sub}}
  .free{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:${C.teal};background:${C.tealL};padding:5px 11px;border-radius:999px}
  h2{font-size:22px;font-weight:700;margin:14px 0 6px;letter-spacing:-.01em}
  .lead{font-size:13.5px;color:${C.sub};margin:0 0 18px;line-height:1.6}
  .tabs{display:flex;gap:4px;background:${C.tint};border:1px solid ${C.line};border-radius:12px;padding:4px;margin-bottom:16px}
  .tab{flex:1;border:none;background:none;font-size:13px;font-weight:600;padding:8px;border-radius:9px;color:${C.sub}}
  .tab[aria-selected="true"]{background:#fff;color:${C.indigo};box-shadow:0 2px 8px -4px rgba(26,29,38,.3)}
  label{display:block;font-size:12px;font-weight:600;color:${C.sub};margin:0 0 6px}
  input{width:100%;font-family:inherit;font-size:14px;padding:11px 13px;border:1px solid #D3D8E1;border-radius:11px;outline:none;color:${C.ink};background:#fff}
  input:focus{border-color:${C.indigo};box-shadow:0 0 0 3px ${C.indigoL}}
  .field{margin-bottom:13px}
  .primary{width:100%;border:none;border-radius:12px;background:${C.indigo};color:#fff;font-size:14.5px;font-weight:600;padding:13px;margin-top:4px;box-shadow:0 10px 24px -10px rgba(92,94,230,.6)}
  .primary:hover{background:${C.indigoD}} .primary:disabled{opacity:.6;cursor:default;box-shadow:none}
  .google{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid #D3D8E1;border-radius:12px;background:#fff;font-size:14px;font-weight:600;padding:12px;color:${C.ink}}
  .google:hover{background:${C.tint}}
  .or{display:flex;align-items:center;gap:12px;margin:16px 0;font-size:11.5px;color:${C.mute}}
  .or:before,.or:after{content:'';flex:1;height:1px;background:${C.line}}
  .err{font-size:12.5px;color:#9B1C1C;background:#FDECEC;border:1px solid #F8C9C9;border-radius:10px;padding:10px 12px;margin-bottom:13px;line-height:1.5}
  .ok{font-size:12.5px;color:#0A6B5C;background:${C.tealL};border:1px solid #A7F0DF;border-radius:10px;padding:10px 12px;margin-bottom:13px;line-height:1.5}
  .link{background:none;border:none;color:${C.indigo};font-size:12.5px;font-weight:600;padding:0}
  .foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:10px;flex-wrap:wrap}
  .why{margin-top:18px;padding-top:16px;border-top:1px solid ${C.line};display:flex;flex-direction:column;gap:9px}
  .why div{display:flex;gap:9px;font-size:12.5px;color:${C.sub};line-height:1.5}
  .why b{color:${C.ink};font-weight:600}
  .skip{width:100%;border:none;background:none;color:${C.sub};font-size:13px;font-weight:600;padding:11px;margin-top:6px;border-radius:11px}
  .skip:hover{background:${C.tint}}
  @media (max-width:420px){ .sheet{padding:20px} h2{font-size:19px} }
</style>

${a.signedIn ? `
  <button class="trigger" part="trigger" data-act="menu">
    <span class="avatar">${initial}</span>
    <span class="tlabel">
      <span class="tname">${esc(a.fullName || a.email.split('@')[0])}</span>
      <span class="tstat"><i class="dot"></i>${statusText}</span>
    </span>
  </button>` : `
  <div style="display:flex;align-items:center;gap:8px">
    <button class="trigger" data-act="menu" title="ข้อมูลเก็บในเครื่องนี้">
      <span class="avatar">◔</span>
      <span class="tlabel"><span class="tname">โหมดใช้ฟรีในเครื่อง</span><span class="tstat"><i class="dot"></i>ไม่ต้องล็อกอิน</span></span>
    </button>
    <button class="cta" data-act="open-signup">สมัคร</button>
  </div>`}

${this.st.menu ? (a.signedIn ? `
  <div class="menu">
    <div class="mhead">
      <span class="avatar" style="width:40px;height:40px;font-size:17px">${initial}</span>
      <div style="min-width:0">
        <div class="mname">${esc(a.fullName || 'ครูของ khuncool')}</div>
        <div class="mmail">${esc(a.email)}</div>
      </div>
    </div>
    <div class="note">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:5px"><i class="dot" style="width:7px;height:7px"></i><b style="color:${C.ink}">${statusText}</b></div>
      ${esc(a.message || 'ห้องเรียน รายชื่อ การเช็กชื่อ และเงินออม ถูกเก็บในบัญชีของคุณ เปิดเครื่องไหนก็เจอข้อมูลเดิม')}
    </div>
    <div style="display:flex;flex-direction:column;gap:2px;margin-top:8px">
      <button class="row" data-act="sync">🔄 ซิงก์เดี๋ยวนี้</button>
      <button class="row" data-act="pull">☁️ ดึงข้อมูลจากคลาวด์ทับเครื่องนี้</button>
      <button class="row" data-act="push">⬆️ ส่งข้อมูลเครื่องนี้ขึ้นคลาวด์</button>
      <a class="row" href="./Khuncool Account.dc.html" style="text-decoration:none">⚙️ จัดการบัญชีและโปรไฟล์</a>
      <button class="row danger" data-act="signout">ออกจากระบบ</button>
    </div>
    <div style="font-size:10.5px;color:${C.mute};margin-top:10px;text-align:center">ทุกฟีเจอร์ของ khuncool ใช้ฟรี ไม่มีค่าใช้จ่าย</div>
  </div>` : `
  <div class="menu">
    <div class="free">✓ ใช้ฟรีทุกฟีเจอร์</div>
    <div class="note" style="margin-top:12px">ตอนนี้ข้อมูลของคุณเก็บอยู่ใน <b style="color:${C.ink}">เครื่องนี้เท่านั้น</b> — ใช้งานได้ครบทุกอย่าง แต่ถ้าเปลี่ยนเครื่องหรือล้างเบราว์เซอร์ ข้อมูลจะหาย</div>
    <button class="primary" data-act="open-signup">สมัคร</button>
    <div style="text-align:center;margin-top:10px"><button class="link" data-act="open-signin">มีบัญชีแล้ว · เข้าสู่ระบบ</button></div>
  </div>`) : ''}

${this.st.sheet ? `
  <div class="scrim" data-act="scrim">
    <div class="sheet" style="position:relative" data-stop="1">
      <button class="x" data-act="close">✕</button>
      <span class="free">✓ ฟรีทุกฟีเจอร์ ไม่มีแพ็กเกจเสียเงิน</span>
      <h2>${this.st.tab === 'signup' ? 'สมัครใช้ khuncool ฟรี' : this.st.tab === 'reset' ? 'ตั้งรหัสผ่านใหม่' : 'เข้าสู่ระบบ khuncool'}</h2>
      <p class="lead">${this.st.tab === 'signup'
        ? 'สมัครแล้วห้องเรียน รายชื่อนักเรียน การเช็กชื่อ และเงินออม จะตามคุณไปทุกเครื่อง — คอมที่โรงเรียน มือถือ แท็บเล็ต'
        : this.st.tab === 'reset' ? 'กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้'
        : 'เข้าสู่ระบบเพื่อดึงข้อมูลห้องเรียนของคุณกลับมาบนเครื่องนี้'}</p>

      ${this.st.tab !== 'reset' ? `
      <div class="tabs" role="tablist">
        <button class="tab" role="tab" aria-selected="${this.st.tab === 'signin'}" data-act="tab-signin">เข้าสู่ระบบ</button>
        <button class="tab" role="tab" aria-selected="${this.st.tab === 'signup'}" data-act="tab-signup">สมัคร</button>
      </div>` : ''}

      ${this.st.err ? `<div class="err">${esc(this.st.err)}</div>` : ''}
      ${this.st.note ? `<div class="ok">${esc(this.st.note)}</div>` : ''}

      ${this.st.tab === 'signup' ? `
      <div class="field"><label>ชื่อ-นามสกุล <span style="color:${C.mute};font-weight:400">(ไม่ใส่ก็ได้)</span></label><input data-f="name" value="${esc(this.st.name)}" placeholder="เช่น ครูสมชาย ใจดี"></div>
      <div class="field"><label>โรงเรียน <span style="color:${C.mute};font-weight:400">(ไม่ใส่ก็ได้)</span></label><input data-f="school" value="${esc(this.st.school)}" placeholder="เช่น โรงเรียนบ้านหนองคูล"></div>` : ''}

      <div class="field"><label>อีเมล</label><input data-f="email" type="email" inputmode="email" value="${esc(this.st.email)}" placeholder="teacher@example.com"></div>
      ${this.st.tab !== 'reset' ? `<div class="field"><label>รหัสผ่าน${this.st.tab === 'signup' ? ' <span style="color:' + C.mute + ';font-weight:400">(อย่างน้อย 6 ตัว)</span>' : ''}</label><input data-f="pw" type="password" value="${esc(this.st.pw)}" placeholder="••••••••"></div>` : ''}

      <button class="primary" data-act="submit" ${this.st.busy ? 'disabled' : ''}>${this.st.busy ? 'กำลังดำเนินการ…' : this.st.tab === 'signup' ? 'สมัคร' : this.st.tab === 'reset' ? 'ส่งลิงก์ตั้งรหัสผ่านใหม่' : 'เข้าสู่ระบบ'}</button>

      ${this.st.tab !== 'reset' ? `
      <div class="or">หรือ</div>
      <button class="google" data-act="google"><svg width="17" height="17" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.15-3.2-.45-4.5H24v9h12.6c-.55 2.9-2.2 5.3-4.6 7l7.7 6c4.5-4.2 6.8-10.3 6.8-17.5z"/><path fill="#FBBC05" d="M10.5 28.6a14.6 14.6 0 010-9.2l-7.9-6.2A24 24 0 000 24c0 3.9.9 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.7-5.8l-7.7-6c-2.1 1.5-4.9 2.4-8 2.4-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z"/></svg> ดำเนินการต่อด้วย Google</button>
      <div class="foot">
        <button class="link" data-act="tab-reset">ลืมรหัสผ่าน?</button>
        <span style="font-size:11.5px;color:${C.mute}">ไม่มีบัตรเครดิต ไม่มีค่าบริการ</span>
      </div>` : `<div class="foot"><button class="link" data-act="tab-signin">← กลับไปเข้าสู่ระบบ</button></div>`}

      ${this.st.tab === 'signup' ? `
      <div class="why">
        <div><span>💾</span><span><b>ข้อมูลตามตัวไปทุกเครื่อง</b> — เช็กชื่อจากมือถือ ดูสรุปบนคอมที่โรงเรียน</span></div>
        <div><span>🔒</span><span><b>เห็นได้แค่คุณ</b> — ข้อมูลผูกกับบัญชีคุณคนเดียว ไม่แชร์ให้ครูคนอื่น</span></div>
        <div><span>🎁</span><span><b>ฟรีถาวร</b> — ทุกเครื่องมือ ทุกแอป ไม่มีแพ็กเกจเสียเงิน</span></div>
      </div>` : ''}
      <button class="skip" data-act="close">ยังไม่สมัคร ใช้แบบเก็บในเครื่องต่อ</button>
    </div>
  </div>` : ''}
`;

      this.shadowRoot.querySelectorAll('[data-f]').forEach(inp => {
        inp.addEventListener('input', e => { this.st[inp.dataset.f] = e.target.value; });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') this.submit(); });
      });
      this.shadowRoot.querySelectorAll('[data-act]').forEach(el => {
        el.addEventListener('click', e => {
          const act = el.dataset.act;
          if (act === 'scrim' && e.target !== el) return;
          e.stopPropagation();
          switch (act) {
            case 'menu': this.set({ menu: !this.st.menu }); break;
            case 'open-signin': this.set({ menu: false, sheet: true, tab: 'signin', err: '', note: '' }); break;
            case 'open-signup': this.set({ menu: false, sheet: true, tab: 'signup', err: '', note: '' }); break;
            case 'tab-signin': this.set({ tab: 'signin', err: '', note: '' }); break;
            case 'tab-signup': this.set({ tab: 'signup', err: '', note: '' }); break;
            case 'tab-reset': this.set({ tab: 'reset', err: '', note: '' }); break;
            case 'close': case 'scrim': this.set({ sheet: false, err: '', note: '' }); break;
            case 'submit': this.submit(); break;
            case 'google': API.signInGoogle(); break;
            case 'sync': this.set({ menu: false }); API.syncNow(); break;
            case 'pull': this.set({ menu: false }); API.pullCloud().then(() => location.reload()); break;
            case 'push': this.set({ menu: false }); API.pushLocal(); break;
            case 'signout': this.set({ menu: false }); API.signOut().then(() => location.reload()); break;
          }
        });
      });
    }
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  if (!customElements.get('khuncool-account')) customElements.define('khuncool-account', KhuncoolAccount);
})();
