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

-- anon and authenticated get nothing. Reads and writes happen server-side
-- with the service-role key; delete is for the admin's ลบถาวร button.
revoke all on table public.kc_support_messages from anon, authenticated;
grant select, insert, update, delete on table public.kc_support_messages to service_role;
