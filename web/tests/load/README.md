# Load tests (k6)

Two-scenario load test against the 150–200 concurrent-user target.
Scenarios run back-to-back in one `k6 run`.

## Prereqs

1. `brew install k6` (or whatever your platform calls for).
2. **A staging deploy** with the broadcast/visibility-gate changes
   (migrations 0075–0077 applied). Don't load-test prod.
3. **A pool of pre-authenticated student cookies.** Sign in 200 staging
   users via magic link once, then dump their `sb-*-auth-token` cookies
   into one file, one per line:

   ```
   sb-foo-auth-token=eyJ...; ...
   sb-foo-auth-token=eyJ...; ...
   ```

   Save as `cookies.txt` (gitignored — these are session credentials).

4. **A live cohort** with 200 confirmed registrations covering those users.

## Run

```bash
TARGET_URL=https://staging.example.com \
COHORT_ID=<cohort-uuid> \
COOKIES_FILE=./cookies.txt \
k6 run web/tests/load/scaling.k6.js
```

For the `vote_burst` scenario to actually cast votes, open a poll in the
admin UI a few seconds before the scenario kicks in (5 min 30 s into the
run) and pass its id:

```bash
POLL_ID=<poll-uuid> k6 run ...
```

## What to watch

| Metric source | Healthy on workshop day |
|---|---|
| k6 `t_active_poll_ms` p95 | < 400 ms |
| k6 `t_dashboard_ms` p95 | < 800 ms |
| k6 `t_vote_ms` p95 | < 600 ms |
| k6 `http_req_failed` rate | < 1 % |
| Supabase Postgres CPU | < 70 % |
| Supabase Realtime concurrent channels | well under 500 |
| Vercel function concurrency / cold starts | minimal — Fluid Compute should keep boxes warm |

If `idle_browse` produces meaningful CPU on Postgres after the broadcast
fix, something else is hot (not the poll/banner endpoints) — go run
`EXPLAIN (ANALYZE, BUFFERS)` on `rpc_active_poll`, `rpc_active_banner`,
`rpc_dashboard_kpis`, `auth_persona`.

## Adjusting for your environment

* `TARGET_URL` should be reachable from k6 with realistic network
  conditions. Don't run from the same Vercel region — you'll hide real
  latency.
* The `5m` idle window compresses the in-product 60 s fallback to a 5 s
  inter-fetch loop so each VU exercises ~60 fallback cycles. Tune as
  needed.
* `/api/vote` is a placeholder — wire it to whatever endpoint or Server
  Action shape you expose for casting a vote. The current `castVote`
  lives as a Server Action; if you want to load-test the action surface
  itself you'll need to mimic the Next.js encrypted-action POST shape, or
  add a thin `/api/vote` route handler that calls the same code path.
