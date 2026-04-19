---
reading_time: 16 min
tags: ["python", "fundamentals", "hands-on"]
video: https://www.youtube.com/embed/VIDEO_ID
lab: {"title": "Clean the hostel mess ratings CSV", "url": "https://example.com/labs/day-08"}
resources: [{"title": "Python 3 docs", "url": "https://docs.python.org/3/"}, {"title": "Real Python tutorials", "url": "https://realpython.com/"}, {"title": "Python tutorial (official)", "url": "https://docs.python.org/3/tutorial/index.html"}]
---

## Intro

You've written Python before. Today is not about syntax — it's about fluency: the handful of moves that separate someone who *uses* Python from someone who *ships* with it. We'll refresh data structures, comprehensions, file I/O, error handling, virtual environments, and a cleaning pipeline you'll reuse all week.

## Read: The parts of Python you actually use every day

Most real code is surprisingly narrow. Ninety percent of what you'll touch this week is: strings, lists, dicts, files, functions, a few stdlib modules, and `pip`. If those feel automatic, everything else becomes easier.

### Data structures as tools, not trivia

> Pick the data structure first. The algorithm usually follows.

| Structure | Use when | Cheap ops |
|-----------|----------|-----------|
| `list` | ordered items, duplicates ok | append, iterate |
| `dict` | lookup by key | `d[k]`, `d.get(k)` |
| `set` | uniqueness, membership | `in`, `&`, `\|` |
| `tuple` | fixed record, hashable | unpack, return |

A concrete example. You have attendance logs and want unique student IDs seen in the last week:

```python
seen = set()
for row in logs:
    if row["date"] >= last_monday:
        seen.add(row["student_id"])
print(len(seen))
```

Using a `list` here would be quadratic. Using a `set` is a one-line fix.

### Comprehensions and generators

A comprehension is a loop that returns a collection. Use it when the loop body is one expression — no more.

```python
# squares of even numbers under 20
evens_sq = [n * n for n in range(20) if n % 2 == 0]

# dict from pairs
grades = {name: score for name, score in rows}

# generator for big files — lazy, memory-friendly
lines = (l.strip() for l in open("big.log"))
```

Rule of thumb: if your comprehension needs a second `if` or a nested loop with a filter, write a real `for` loop. Readability beats cleverness.

### Files, paths, and encodings

Always use `pathlib` and always specify encoding. Half the "it works on my laptop" bugs are `utf-8` vs `cp1252`.

```python
from pathlib import Path
data = Path("data/mess_ratings.csv").read_text(encoding="utf-8")
```

### Errors are control flow, not surprises

```python
try:
    rating = int(row["score"])
except ValueError:
    rating = None  # log and continue, don't crash the batch
```

Catch the specific exception. `except:` alone will swallow `KeyboardInterrupt` and ruin your debugging day.

### Virtual envs — the non-negotiable

Every project gets its own env. No exceptions.

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install pandas requests
pip freeze > requirements.txt
```

If you've ever had `pip install` break a project you worked on six months ago, this is why.

## Watch: A tour of idiomatic Python

A short walkthrough of the moves above in real code — comprehensions, `pathlib`, `enumerate`, `zip`, f-strings, and why `if __name__ == "__main__"` exists.

https://www.youtube.com/embed/VIDEO_ID
<!-- TODO: replace video -->

- Watch for how the author reaches for `dict` and `set` before `list`.
- Notice the pattern: parse → transform → write. Every data script has this shape.
- Pay attention to how errors are logged, not swallowed.

## Lab: Clean the hostel mess ratings CSV

You have a messy CSV of nightly mess ratings submitted by hostelers: `student_id, date, dish, score, comment`. Scores are sometimes blank, sometimes "4/5", sometimes "four". Dishes have typos ("Paneeer", "paneer"). Your job: produce a clean JSON summary and a bar chart of the top 5 dishes.

1. Set up the project:
   ```bash
   mkdir mess-ratings && cd mess-ratings
   python3 -m venv .venv && source .venv/bin/activate
   pip install pandas matplotlib
   ```
2. Download the sample CSV (your instructor will drop `mess_ratings.csv` in the shared folder). Put it in `data/`.
3. Create `clean.py`. Load with `pandas.read_csv("data/mess_ratings.csv")` and print `df.head()`, `df.info()`, `df["score"].unique()`. Look at the mess before you touch it.
4. Write a function `normalize_score(raw) -> float | None` that handles ints, "4/5", "four", blanks. Add tests by calling it on five sample inputs.
5. Normalize dish names: lowercase, strip whitespace, collapse obvious typos with a lookup dict `{"paneeer": "paneer", ...}`.
6. Drop rows where score is `None` after normalization. Log how many you dropped.
7. Aggregate: average score per dish, count per dish. Use `df.groupby("dish").agg(avg=("score","mean"), n=("score","count"))`.
8. Write the result to `out/summary.json` with `orient="records"` and `indent=2`.
9. Plot the top 5 dishes by average score (min 10 ratings) using `matplotlib`. Save to `out/top5.png`.
10. Commit your `clean.py`, `requirements.txt`, and `out/` outputs to a fresh git repo. Push to GitHub. You'll need this repo on Day 12.

Stretch: re-run the pipeline with a single command `python clean.py --in data/mess_ratings.csv --out out/` using `argparse`.

## Quiz

The quiz will check whether you can pick the right data structure, read comprehensions at a glance, reason about file encodings, and explain what a virtual environment isolates. Four questions, mostly multiple choice, one short answer on `try/except` placement.

## Assignment

Submit your `mess-ratings` GitHub repo link. The repo must contain `clean.py`, `requirements.txt`, `README.md` with a run command, and the `out/summary.json` plus `out/top5.png`. In the README, include one paragraph on the dirtiest field you found and how you normalized it. Due before Day 10 starts.

## Discuss: When is Python the wrong tool?

- You need to run the same cleaning job on 50 GB of ratings every hour. Is Python + pandas still the right call? What breaks first?
- A teammate writes a 400-line comprehension. It works. Do you ask them to rewrite it? Why or why not?
- Your seniors say "just use Jupyter for everything." What do you lose by skipping `.py` files and `git`?
- Should `requirements.txt` pin exact versions (`pandas==2.2.1`) or ranges (`pandas>=2.0`)? Defend your choice for a student project vs. a company project.
