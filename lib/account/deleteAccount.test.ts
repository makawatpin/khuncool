import { describe, expect, it, vi } from "vitest";
import { deleteAccountForToken, type AccountAdmin } from "./deleteAccount";

function fakeAdmin(opts: { userId?: string; getUserError?: boolean; deleteError?: boolean } = {}) {
  const deleteUser = vi.fn(async () => ({ error: opts.deleteError ? { message: "boom" } : null }));
  const admin: AccountAdmin = {
    auth: {
      getUser: async () =>
        opts.getUserError || !opts.userId
          ? { data: { user: null }, error: { message: "bad token" } }
          : { data: { user: { id: opts.userId } }, error: null },
      admin: { deleteUser },
    },
  };
  return { admin, deleteUser };
}

describe("deleteAccountForToken", () => {
  it("deletes the account the token belongs to", async () => {
    const { admin, deleteUser } = fakeAdmin({ userId: "u1" });
    expect(await deleteAccountForToken("tok", admin)).toEqual({ status: 200 });
    expect(deleteUser).toHaveBeenCalledWith("u1");
  });

  it("refuses without a token or with an invalid one", async () => {
    const none = fakeAdmin({ userId: "u1" });
    expect((await deleteAccountForToken("", none.admin)).status).toBe(401);
    expect(none.deleteUser).not.toHaveBeenCalled();

    const bad = fakeAdmin({ getUserError: true });
    expect((await deleteAccountForToken("tok", bad.admin)).status).toBe(401);
    expect(bad.deleteUser).not.toHaveBeenCalled();
  });

  it("reports a failed delete", async () => {
    const { admin } = fakeAdmin({ userId: "u1", deleteError: true });
    expect((await deleteAccountForToken("tok", admin)).status).toBe(500);
  });
});
