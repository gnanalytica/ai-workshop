---
reading_time: 15 min
tags: ["apis", "python", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Hit a real API with requests and handle pagination", "url": "https://example.com/labs/day-10"}
resources: [{"title": "requests library", "url": "https://requests.readthedocs.io/"}, {"title": "httpbin — test HTTP requests", "url": "https://httpbin.org/"}, {"title": "JSONPlaceholder fake API", "url": "https://jsonplaceholder.typicode.com/"}, {"title": "MDN HTTP overview", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"}]
---

## Intro

An API is just a contract: "if you send me this request, I'll send you back this response." Today you'll stop being intimidated by API docs and start reading them the way engineers do — method, path, auth, body, response, errors.

## Read: HTTP, REST, and the shape of a request

### The five things in every HTTP request

1. **Method** — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
2. **URL** — `https://api.github.com/users/torvalds`
3. **Headers** — metadata (auth, content type, user agent)
4. **Body** — the payload (for `POST`/`PUT`/`PATCH`)
5. **Query params** — `?page=2&per_page=50`

And the five things in every response: **status code**, **headers**, **body**, **timing**, and (sometimes) **pagination hints**.

### Status codes that matter

| Code | Meaning | Who's at fault |
|------|---------|----------------|
| 200 | OK | nobody |
| 201 | Created | nobody |
| 204 | No Content | nobody |
| 400 | Bad Request | you |
| 401 | Unauthorized | you (no/bad token) |
| 403 | Forbidden | you (wrong perms) |
| 404 | Not Found | you (wrong URL) or them |
| 429 | Rate Limited | you (too fast) |
| 5xx | Server error | them |

If you see `500` on your first call, it's usually *you* sending a malformed body — always check the response body before blaming the server.

### `curl` is your microscope

Before writing Python, hit the endpoint with `curl`. It's the fastest way to see what's happening.

```bash
curl -s https://api.github.com/users/torvalds | jq .
curl -s -X POST https://httpbin.org/post \
  -H "Content-Type: application/json" \
  -d '{"hello": "world"}' | jq .
```

`httpbin.org` echoes back what you sent — perfect for debugging.

### Python: `requests` is still the default

```python
import requests

r = requests.get(
    "https://api.github.com/users/torvalds/repos",
    params={"per_page": 100, "page": 1},
    headers={"User-Agent": "campus-workshop/1.0",
             "Accept": "application/vnd.github+json"},
    timeout=10,
)
r.raise_for_status()      # throw on 4xx/5xx
data = r.json()
```

Three things students skip and then regret:

> **Always** set a `timeout`. Without one, a hung server hangs your script forever.
> **Always** call `raise_for_status()` (or check `r.status_code`) before using `r.json()`.
> **Always** set a `User-Agent`. Some APIs silently block unknown clients.

### Pagination, rate limits, retries

Most APIs paginate. Three common styles:

- **Offset/limit**: `?page=2&per_page=50`
- **Cursor**: response includes `next_cursor`, pass it back
- **Link header**: GitHub style — `Link: <...>; rel="next"`

Loop until there's no next page. Back off on `429`:

```python
import time
def get_all(url, params):
    out, page = [], 1
    while True:
        r = requests.get(url, params={**params, "page": page}, timeout=10)
        if r.status_code == 429:
            time.sleep(int(r.headers.get("Retry-After", "5")))
            continue
        r.raise_for_status()
        batch = r.json()
        if not batch: return out
        out.extend(batch)
        page += 1
```

### Auth in 30 seconds

| Scheme | Header | Where you get the token |
|--------|--------|-------------------------|
| API key | `Authorization: Bearer xxx` or `X-API-Key: xxx` | dashboard |
| OAuth | `Authorization: Bearer xxx` | login flow |
| Basic | `Authorization: Basic base64(user:pass)` | rare now |

Never commit tokens. Use environment variables + `python-dotenv`.

## Watch: Reading API docs like an engineer

A walkthrough of how to land on a new API's docs page and go from "I have no idea" to a working `curl` in five minutes.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch how they find the base URL, auth section, and one example endpoint first.
- Notice they test with `curl` or Postman before writing code.
- See how they map error codes back to docs.

## Lab: Build a GitHub repo explorer

Use the public GitHub API (no auth needed for low traffic, but you'll get better rate limits with a token). Goal: given a username, fetch all their public repos, handle pagination, dump to CSV, and print top 5 by stars.

1. Create project: `mkdir gh-explorer && cd gh-explorer && python3 -m venv .venv && source .venv/bin/activate && pip install requests`.
2. First, hit it by hand: `curl -s "https://api.github.com/users/torvalds/repos?per_page=5" | jq '.[].name'`. Read the response shape.
3. Create a [personal access token](https://github.com/settings/tokens) (classic, no scopes needed for public). Put it in `.env`: `GH_TOKEN=ghp_...`. Add `.env` to `.gitignore` now.
4. Write `explorer.py`. Load the token with `os.environ.get("GH_TOKEN")` (use `python-dotenv` if you prefer).
5. Implement `get_repos(username)` that paginates until no more repos come back. Use `per_page=100`. Handle 404 (user doesn't exist) with a clean error message.
6. Add retry + backoff for `429` and `5xx`. Cap at 3 retries.
7. Write `repos.csv` with columns: `name, stars, forks, language, updated_at`. Use the `csv` module.
8. Print the top 5 repos by stars as a table. Use plain `print` or `rich` if you want polish.
9. Add `--user` as a CLI arg via `argparse`. Run it on 3 different usernames.
10. Commit, push, open a GitHub issue on your own repo listing one thing that surprised you about the API.

Stretch: swap the target to the [OpenLibrary API](https://openlibrary.org/developers/api) and list the top 10 works by an author.

## Quiz

Four questions on HTTP methods and status codes, what `raise_for_status()` does, pagination strategies, and where to put secrets.

## Assignment

Submit the `gh-explorer` repo. Include a `README.md` with the exact command to run it, a sample `repos.csv` (for a public user like `torvalds`), and one paragraph in a `NOTES.md` on how you decided to handle rate limits.

## Discuss: API design choices

- GitHub uses `Link` headers for pagination; Stripe uses cursors; most small APIs use `?page=`. Why do big APIs move to cursors as they scale?
- Should an API return `200` with `{"error": "..."}` or a real `4xx`? What does each choice cost the client?
- A teammate commits an API key to the repo. The repo is public for 20 minutes before they notice. What's the correct response, in order?
- You're designing an API for a campus hostel booking app. Walk through three endpoints you'd expose and the method + path for each.
