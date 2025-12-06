create extension if not exists "pgcrypto";

create sequence if not exists raffle_number_seq start 1 increment 1;

create table if not exists public.raffle_entries (
  id uuid primary key default gen_random_uuid(),
  raffle_number integer not null default nextval('raffle_number_seq'),
  kid_name varchar(255) not null,
  date_of_birth date not null,
  grade varchar(50) not null,
  parent_name varchar(255) not null,
  parent_phone varchar(20) not null,
  submission_batch_id uuid,
  created_at timestamptz not null default now(),
  sms_sent boolean not null default false,
  sms_sent_at timestamptz null
);

create unique index if not exists raffle_entries_raffle_number_idx
  on public.raffle_entries (raffle_number);

create index if not exists raffle_entries_parent_phone_idx
  on public.raffle_entries (parent_phone);

create index if not exists raffle_entries_created_at_idx
  on public.raffle_entries (created_at desc);

create index if not exists raffle_entries_submission_batch_id_idx
  on public.raffle_entries (submission_batch_id);

