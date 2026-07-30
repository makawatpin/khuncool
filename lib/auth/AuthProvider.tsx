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
  return msg || "เกิดข้อผิดพลาด";
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
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { ok: false, error: translate(error.message) };
      setSession(data.session);
      setUser(data.user);
      return { ok: true };
    },
    []
  );

  const signInGoogle = useCallback(async (): Promise<AuthResult | void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.href : undefined },
    });
    if (error) return { ok: false, error: translate(error.message) };
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? window.location.href : undefined,
    });
    if (error) return { ok: false, error: translate(error.message) };
    return { ok: true };
  }, []);

  const updateProfile = useCallback(async (meta: ProfileMeta): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: meta.fullName || "", school: meta.school || "" },
    });
    if (error) return { ok: false, error: translate(error.message) };
    setUser(data.user);
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
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
