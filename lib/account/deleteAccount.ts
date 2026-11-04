/** The slice of a service-role Supabase client this needs (faked in tests). */
export interface AccountAdmin {
  auth: {
    getUser: (
      token: string,
    ) => Promise<{ data: { user: { id: string } | null }; error: { message: string } | null }>;
    admin: { deleteUser: (id: string) => Promise<{ error: { message: string } | null }> };
  };
}

/**
 * Deletes the account that owns the bearer `token`, and only that account.
 * The database removes everything tied to it: synced app data (`kc_state`)
 * and content sets cascade; usage events keep no link (`on delete set null`).
 */
export async function deleteAccountForToken(
  token: string,
  admin: AccountAdmin,
): Promise<{ status: 200 | 401 | 500; error?: string }> {
  if (!token) return { status: 401, error: "missing bearer token" };
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return { status: 401, error: "invalid session" };
  const { error: deleteError } = await admin.auth.admin.deleteUser(data.user.id);
  if (deleteError) return { status: 500, error: deleteError.message };
  return { status: 200 };
}
