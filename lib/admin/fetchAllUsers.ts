import "server-only";

/** One page of `auth.admin.listUsers`, and the slice of a user we read. */
export interface AdminUser {
  id: string;
  email?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
}

/** The one method this needs from a service-role client (faked in tests). */
export interface UserLister {
  auth: {
    admin: {
      listUsers: (params: { page: number; perPage: number }) => Promise<{
        data: { users: AdminUser[]; nextPage?: number | null };
        error: { message: string } | null;
      }>;
    };
  };
}

const PER_PAGE = 200;

/* Pages past the first page of users, which the admin routes previously did
   not do — they asked for `perPage: 1000` once and used whatever came back,
   so every figure on the dashboard (total users, active this week, signups
   today, the 30-day chart) would quietly stop growing once the project
   passed one page of accounts. This is the same failure fetchAllToolEvents
   already exists to prevent, and its comment records what it looked like in
   August: numbers that were not obviously broken, just wrong and smaller
   than reality.

   Paging stops on the server's own `nextPage` rather than on a short page.
   GoTrue clamps `per_page` to its own maximum, so a page can legitimately
   come back smaller than the size that was asked for — treating that as the
   end would reintroduce exactly the bug being fixed here, and would do it
   invisibly. `nextPage` is derived from the response's Link header, so it
   reflects what the server actually has. */
const MAX_PAGES = 500;

export async function fetchAllUsers(client: UserLister): Promise<AdminUser[]> {
  const users: AdminUser[] = [];
  let page = 1;

  for (let fetched = 0; fetched < MAX_PAGES; fetched++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (!data.nextPage) return users;
    page = data.nextPage;
  }

  // Refuse to return a truncated list. Silently-short results are the whole
  // reason this function exists, so the guard against a server that keeps
  // advertising a next page has to fail loudly rather than look successful.
  throw new Error(
    `listUsers did not terminate within ${MAX_PAGES} pages (${PER_PAGE} per page)`,
  );
}
