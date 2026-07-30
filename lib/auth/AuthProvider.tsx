"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

/* ---------------------------------------------------------------------- */
/* Error translation — ported verbatim from reference/khuncool-cloud.js   */
/* ---------------------------------------------------------------------- */

function translate(msg: string | undefined | null): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "อีเมลนี้สมัครไว้แล้ว — ลองเข้าสู่ระบบ";
  if (m.includes("password should be at least"))
    return "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร";
  if (m.includes("email not confirmed"))
    return "ยังไม่ยืนยันอีเมล — เช็กกล่องจดหมายก่อนนะ";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "รูปแบบอีเมลไม่ถูกต้อง";
  if (m.includes("rate limit") || m.includes("too many"))
    return "ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่";
  if (m.includes("provider is not enabled"))
    return "ยังไม่ได้เปิด Google login ใน Supabase (ใช้อีเมล+รหัสผ่านได้เลย)";
  // Network-level failures (Supabase's SDK wraps a rejected fetch — offline,
  // DNS, CORS, edge outage — into an AuthError with messages like these
  // rather than throwing) — not in the reference's translate(), but a raw
  // "Failed to fetch" is not something a non-technical user should see.
  if (
    m.includes("failed to fetch") ||
    m.includes("networkerror") ||
    m.includes("load failed") ||
    m.includes("network request failed")
  )
    return "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — เช็กอินเทอร์เน็ตแล้วลองใหม่";
  return msg || "เกิดข้อผิดพลาด";
}

/** Translates values thrown outside Supabase's structured `{error}`
 *  responses (network failure, DNS, CORS, offline, unexpected exceptions).
 *  Falls back to a generic Thai message instead of leaking a raw
 *  English/technical string when nothing recognizable matches. */
function translateUnknown(err: unknown): string {
  const msg =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const known = translate(msg);
  // translate() echoes back an unrecognized-but-truthy message verbatim;
  // for values we caught outside Supabase's own error shape, prefer a
  // Thai fallback over surfacing a raw technical string to the user.
  if (known === msg && msg) return "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
  return known;
}

/* ---------------------------------------------------------------------- */
/* Types                                                                  */
/* ---------------------------------------------------------------------- */

type AuthResult = { ok: true; confirm?: boolean } | { ok: false; error: string };

interface ProfileMeta {
  fullName?: string;
  school?: string;
}

interface AuthContextValue {
  ready: boolean;
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, meta?: ProfileMeta) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signInGoogle: () => Promise<AuthResult | void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateProfile: (meta: ProfileMeta) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
        setReady(true);
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, meta?: ProfileMeta): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: meta?.fullName || "",
              school: meta?.school || "",
            },
          },
        });
        if (error) return { ok: false, error: translate(error.message) };
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          return { ok: true };
        }
        return { ok: true, confirm: true };
      } catch (err) {
        return { ok: false, error: translateUnknown(err) };
      }
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { ok: false, error: translate(error.message) };
        setSession(data.session);
        setUser(data.user);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: translateUnknown(err) };
      }
    },
    []
  );

  const signInGoogle = useCallback(async (): Promise<AuthResult | void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined },
      });
      if (error) return { ok: false, error: translate(error.message) };
    } catch (err) {
      return { ok: false, error: translateUnknown(err) };
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== "undefined" ? window.location.href : undefined,
      });
      if (error) return { ok: false, error: translate(error.message) };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: translateUnknown(err) };
    }
  }, []);

  const updateProfile = useCallback(async (meta: ProfileMeta): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: meta.fullName || "", school: meta.school || "" },
      });
      if (error) return { ok: false, error: translate(error.message) };
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: translateUnknown(err) };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // best-effort: clear local state regardless of network failure
    } finally {
      setSession(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      ready,
      user,
      session,
      signUp,
      signIn,
      signInGoogle,
      resetPassword,
      updateProfile,
      signOut,
    }),
    [ready, user, session, signUp, signIn, signInGoogle, resetPassword, updateProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
