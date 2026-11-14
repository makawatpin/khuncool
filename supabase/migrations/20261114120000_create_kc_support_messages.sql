-- Messages teachers leave in the เลี้ยงกาแฟคุณคูล sheet.
--
-- Unlike tool_events, the client never touches this table. Every write goes
-- through POST /api/support/message, which uses the service-role key and
-- refuses new messages once 20 are waiting for moderation. tool_events lets
-- anon insert directly and cannot rate limit (see
-- 20261104150000_tighten_tool_events_insert.sql); that is acceptable for
-- usage counters but not for text that may end up on a public page.
--
-- No sender data is stored beyond what the teacher types: no IP, no user id.

create table public.kc_support_messages (
  id         bigint generated always as identity primary key,
  name       text,
  message    text not null,
  status     text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.kc_support_messages enable row level security;

alter table public.kc_support_messages
  add constraint kc_support_messages_name_length
    check (name is null or char_length(name) between 1 and 60),
  add constraint kc_support_messages_message_length
    check (char_length(message) between 1 and 500),
  add constraint kc_support_messages_status_known
    check (status in ('pending', 'approved', 'hidden'));

-- The queue-cap count and the thank-you wall both filter on status and sort
-- by time.
create index kc_support_messages_status_created_idx
  on public.kc_support_messages (status, created_at desc);

-- The queue cap, enforced where concurrent requests cannot race past it.
-- The API route counts pending rows first as a fast path, but two requests
-- can both read 19 and both insert. The transaction-scoped advisory lock
-- makes pending inserts take turns, so the count each one sees is final.
-- 20 must match SUPPORT_QUEUE_CAP in lib/support/message.ts, and the message
-- text must match QUEUE_FULL_SQL_MESSAGE in lib/support/store.ts.
create function public.kc_support_messages_queue_cap()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'pending' then
    perform pg_advisory_xact_lock(hashtext('kc_support_messages_queue_cap'));
    if (select count(*) from public.kc_support_messages where status = 'pending') >= 20 then
      raise exception 'kc_support_messages_queue_full';
    end if;
  end if;
  return new;
end;
$$;

create trigger kc_support_messages_queue_cap
  before insert on public.kc_support_messages
  for each row execute function public.kc_support_messages_queue_cap();

revoke all on function public.kc_support_messages_queue_cap() from public, anon, authenticated;

-- anon and authenticated get nothing. Reads and writes happen server-side
-- with the service-role key; delete is for the admin's ลบถาวร button.
revoke all on table public.kc_support_messages from anon, authenticated;
grant select, insert, update, delete on table public.kc_support_messages to service_role;
