/* eslint-disable */
// k6 load test for the 150–200 concurrent-user target.
//
// Run:
//   TARGET_URL=https://staging.example.com \
//   COHORT_ID=<uuid> \
//   COOKIES_FILE=./cookies.txt \
//   k6 run web/tests/load/scaling.k6.js
//
// COOKIES_FILE is a newline-separated list of full Cookie header strings,
// one per pre-authenticated test student. The script picks one per VU.
// Generate it however you like — e.g. magic-link sign-in 200 staging users
// once and dump their `sb-*-auth-token` cookies. Keep this file local; it
// holds session credentials.
//
// Two scenarios run back-to-back:
//   1) idle_browse — 200 VUs sit on /dashboard polling like a real student
//      for 5 min. Confirms the new broadcast pattern + visibility gate
//      really did kill the steady-state load.
//   2) vote_burst — admin opens a poll (out-of-band), then 200 VUs hit
//      /api/active-poll, 150 of them POST a vote within 10 s, all 200 see
//      results. Watch p95 + Postgres CPU + Realtime channel count.

import http from "k6/http";
import { check, sleep, fail } from "k6";
import { Trend, Counter } from "k6/metrics";
import { SharedArray } from "k6/data";

const TARGET_URL = __ENV.TARGET_URL;
const COHORT_ID = __ENV.COHORT_ID;
const COOKIES_FILE = __ENV.COOKIES_FILE;
const POLL_ID = __ENV.POLL_ID || ""; // optional: set when running vote_burst against an open poll

if (!TARGET_URL) fail("TARGET_URL is required");
if (!COHORT_ID) fail("COHORT_ID is required");

const cookies = new SharedArray("cookies", () => {
  if (!COOKIES_FILE) fail("COOKIES_FILE is required");
  // open() is k6's only file-read primitive; available at init.
  // eslint-disable-next-line no-undef
  const raw = open(COOKIES_FILE);
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
});

const t_active_poll = new Trend("t_active_poll_ms", true);
const t_active_banner = new Trend("t_active_banner_ms", true);
const t_dashboard = new Trend("t_dashboard_ms", true);
const t_vote = new Trend("t_vote_ms", true);
const c_vote_ok = new Counter("vote_ok");
const c_vote_fail = new Counter("vote_fail");

export const options = {
  scenarios: {
    idle_browse: {
      executor: "constant-vus",
      vus: 200,
      duration: "5m",
      exec: "idleBrowse",
      gracefulStop: "30s",
    },
    vote_burst: {
      executor: "ramping-vus",
      startTime: "5m30s",
      startVUs: 0,
      stages: [
        { duration: "5s", target: 200 }, // 200 students "land" on the page
        { duration: "10s", target: 200 }, // window in which voting happens
        { duration: "20s", target: 200 }, // results visible
        { duration: "5s", target: 0 },
      ],
      exec: "voteBurst",
      gracefulStop: "30s",
    },
  },
  thresholds: {
    // Workshop-day budget. Adjust if your network adds floor latency.
    "t_active_poll_ms": ["p(95)<400"],
    "t_active_banner_ms": ["p(95)<400"],
    "t_dashboard_ms": ["p(95)<800"],
    "t_vote_ms": ["p(95)<600"],
    "http_req_failed": ["rate<0.01"],
  },
};

function pickCookie() {
  // eslint-disable-next-line no-undef
  return cookies[Math.floor(Math.random() * cookies.length)];
}

function authedHeaders() {
  return { Cookie: pickCookie() };
}

/** Mimics a logged-in student sitting on /dashboard with the broadcast-driven
 *  popup + banner. Hits each fallback poll endpoint once a minute (post-fix). */
export function idleBrowse() {
  const headers = authedHeaders();
  // /dashboard SSR
  let r = http.get(`${TARGET_URL}/dashboard`, { headers });
  t_dashboard.add(r.timings.duration);
  check(r, { "dashboard 200": (x) => x.status === 200 });

  // Fallback poll cycle — once per 60s in real life. Compress to 5s here
  // so 5 min of test exercises ~60 fallback fetches per VU.
  for (let i = 0; i < 60; i++) {
    r = http.get(`${TARGET_URL}/api/active-poll?cohortId=${COHORT_ID}`, {
      headers,
      tags: { name: "active-poll" },
    });
    t_active_poll.add(r.timings.duration);
    check(r, { "poll 200": (x) => x.status === 200 });

    r = http.get(`${TARGET_URL}/api/active-banner?cohortId=${COHORT_ID}`, {
      headers,
      tags: { name: "active-banner" },
    });
    t_active_banner.add(r.timings.duration);
    check(r, { "banner 200": (x) => x.status === 200 });

    sleep(5);
  }
}

/** Vote storm. The poll must already be open — pass POLL_ID, or seed a poll
 *  via your admin UI / a one-shot script just before running this scenario. */
export function voteBurst() {
  const headers = authedHeaders();

  // Everyone fetches the active poll first.
  let r = http.get(`${TARGET_URL}/api/active-poll?cohortId=${COHORT_ID}`, {
    headers,
    tags: { name: "active-poll-burst" },
  });
  t_active_poll.add(r.timings.duration);
  const ok = check(r, { "poll fetched": (x) => x.status === 200 });
  if (!ok) return;

  // 75% of VUs vote, 25% just observe. Roughly matches workshop reality.
  if (POLL_ID && Math.random() < 0.75) {
    const body = JSON.stringify({ poll_id: POLL_ID, choice: "1" });
    const headers2 = { ...headers, "Content-Type": "application/json" };
    // Adjust path if your action surface uses a different URL.
    const start = Date.now();
    const vr = http.post(`${TARGET_URL}/api/vote`, body, {
      headers: headers2,
      tags: { name: "vote" },
    });
    t_vote.add(Date.now() - start);
    if (vr.status >= 200 && vr.status < 300) c_vote_ok.add(1);
    else c_vote_fail.add(1);
  }

  // Hold for the close + results window.
  sleep(20);

  r = http.get(`${TARGET_URL}/api/active-poll?cohortId=${COHORT_ID}`, {
    headers,
    tags: { name: "active-poll-results" },
  });
  t_active_poll.add(r.timings.duration);
  check(r, { "results 200": (x) => x.status === 200 });
}
