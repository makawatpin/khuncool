import { describe, expect, it, vi } from "vitest";
import { fetchAllUsers, type AdminUser, type UserLister } from "./fetchAllUsers";

function user(id: string): AdminUser {
  return { id, created_at: "2026-03-14T00:00:00Z" };
}

/** A lister holding `total` accounts, served `pageSize` at a time. */
function fakeLister(total: number, pageSize: number) {
  const listUsers = vi.fn(async ({ page }: { page: number }) => {
    const start = (page - 1) * pageSize;
    const slice = Array.from({ length: Math.max(0, Math.min(pageSize, total - start)) }, (_, i) =>
      user(`u${start + i}`),
    );
    const hasMore = start + slice.length < total;
    return { data: { users: slice, nextPage: hasMore ? page + 1 : null }, error: null };
  });
  return { client: { auth: { admin: { listUsers } } } as UserLister, listUsers };
}

describe("fetchAllUsers", () => {
  it("returns every user across pages, in order", async () => {
    const { client, listUsers } = fakeLister(450, 200);
    const users = await fetchAllUsers(client);
    expect(users).toHaveLength(450);
    expect(users[0].id).toBe("u0");
    expect(users[449].id).toBe("u449");
    expect(listUsers).toHaveBeenCalledTimes(3);
  });

  it("stops after one request when there is no next page", async () => {
    const { client, listUsers } = fakeLister(12, 200);
    expect(await fetchAllUsers(client)).toHaveLength(12);
    expect(listUsers).toHaveBeenCalledTimes(1);
  });

  it("keeps paging when the server clamps the page size below the request", async () => {
    // The regression guard: GoTrue may serve fewer rows than `perPage`, so a
    // short page must not be read as the last one. 1000 users at 50 per page
    // is 20 requests — the old single call would have returned 50.
    const { client, listUsers } = fakeLister(1000, 50);
    expect(await fetchAllUsers(client)).toHaveLength(1000);
    expect(listUsers).toHaveBeenCalledTimes(20);
  });

  it("handles an empty project", async () => {
    const { client } = fakeLister(0, 200);
    expect(await fetchAllUsers(client)).toEqual([]);
  });

  it("surfaces a failed page instead of returning a partial list", async () => {
    const listUsers = vi.fn(async ({ page }: { page: number }) =>
      page === 1
        ? { data: { users: [user("u0")], nextPage: 2 }, error: null }
        : { data: { users: [] }, error: { message: "rate limited" } },
    );
    const client = { auth: { admin: { listUsers } } } as UserLister;
    await expect(fetchAllUsers(client)).rejects.toThrow("rate limited");
  });

  it("throws rather than truncate if the server never stops advertising pages", async () => {
    const listUsers = vi.fn(async ({ page }: { page: number }) => ({
      data: { users: [user(`u${page}`)], nextPage: page + 1 },
      error: null,
    }));
    const client = { auth: { admin: { listUsers } } } as UserLister;
    await expect(fetchAllUsers(client)).rejects.toThrow("did not terminate");
  });
});
