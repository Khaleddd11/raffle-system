alter table public.raffle_entries
  add column if not exists submission_batch_id uuid;

create index if not exists raffle_entries_submission_batch_id_idx
  on public.raffle_entries (submission_batch_id);

