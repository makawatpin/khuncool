import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));
vi.mock("@/lib/admin/requireAdmin", () => ({
  requireAdmin: async () => ({ ok: true, email: "admin@example.com" }),
}));
// Any query chain resolves with no error.
function chain(): unknown {
  return new Proxy(() => {}, {
    get: (_t, key) => (key === "then" ? (ok: (v: unknown) => void) => ok({ error: null }) : chain()),
    apply: () => chain(),
  });
}
vi.mock("@/lib/supabase/serviceClient", () => ({ createServiceRoleClient: () => chain() }));

const { PATCH, DELETE } = await import("./route");

beforeEach(() => revalidatePath.mockClear());

describe("admin support moderation", () => {
  it("refreshes the public wall after a status change", async () => {
    const res = await PATCH(
      new Request("http://x/api/admin/support", {
        method: "PATCH",
        body: JSON.stringify({ id: 3, status: "hidden" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/support");
  });

  it("refreshes the public wall after a delete", async () => {
    const res = await DELETE(new Request("http://x/api/admin/support?id=3", { method: "DELETE" }));
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/support");
  });

  it("does not refresh on a rejected request", async () => {
    const res = await DELETE(new Request("http://x/api/admin/support?id=abc", { method: "DELETE" }));
    expect(res.status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
