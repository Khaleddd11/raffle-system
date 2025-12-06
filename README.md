## Kids' Raffle Registration

Single-page registration app with sequential raffle IDs, SMS confirmation hook, and a password-protected admin dashboard with search and Excel export.

### Stack
- Next.js (App Router, TypeScript)
- Tailwind + shadcn/ui
- Supabase (Postgres)
- XLSX for export

### Setup
1) Requirements  
- Node 20.x (recommended)  
- npm  

2) Install deps  
```bash
npm install
```

3) Configure env vars in `env.example` and copy to `.env.local`  
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SMS_API_KEY=
SMS_API_SECRET=
SMS_SENDER_NUMBER=
ADMIN_PASSWORD=
```

4) Create Supabase schema (sequential raffle numbers)  
Run `supabase/migrations/001_init.sql` in your project database.

5) Run the app locally  
```bash
npm run dev
```
Open http://localhost:3000

6) Ticket preview route  
After a successful registration you are redirected to `/ticket-preview` with query params carrying the submitted data and raffle number.

### Features
- Multi-child form: add/remove children (kid name, DOB, grade). Parent info entered once.  
- Inline validation, submit disabled until valid, loading + double-submit guard.
- Rate limit: max 5 entries per phone per day (server enforced across children).
- Sequential raffle number from Postgres sequence; stacked names/numbers on ticket preview.
- SMS hook stub in `src/lib/sms.ts` (replace with real provider, still saves entries on failure).
- Admin route `/admin` with env password, stats, search, SMS status, Excel export (`raffle_entries_YYYY-MM-DD.xlsx`), phone preserved as text, includes submission_batch_id.

