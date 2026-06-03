# Detail-sheet subagent instructions (shared)

You build ONE Google Sheet for ONE assignment: every student's submission with its
answer, AI score, comments, strengths/weaknesses, and the rubric shown as reference.
Return ONLY the sheet link + row count. Never paste submission bodies into your final message.

## Inputs you are given
- ASSIGNMENT_ID
- DAY + TITLE (for the sheet name)
- RUBRIC_SOURCE = "db"  OR  "file:<key>" (key in cohort-reports/gap-day-rubrics.json)
- FOLDER_ID = 12to-Fo_GsKZss17WauiOwnqpsvuCJspe   (create the sheet inside this Drive folder)

## Tools
- DB: `mcp__plugin_supabase_supabase__execute_sql`, project_id `ucqatbscxgborqsgnrjl`.
  (If schema not loaded: ToolSearch "select:mcp__plugin_supabase_supabase__execute_sql".)
- Drive: `mcp__claude_ai_Google_Drive__create_file` (contentMimeType text/csv → auto-converts to a Google Sheet).
  (If not loaded: ToolSearch "select:mcp__claude_ai_Google_Drive__create_file".)

## Steps
1. Load rubric.
   - db: `select rt.criteria::text from assignments a join rubric_templates rt on rt.id=a.rubric_id where a.id='<ID>';`
   - file:<key>: Read cohort-reports/gap-day-rubrics.json, take object under <key>.
   Build a one-line rubric reference string: for each criterion `name (max N): 0=…|1=…|…`, then `[scale_max=10]`.
2. Fetch submissions, PAGING ≤25 rows/query to avoid overflow:
   ```sql
   select s.id, p.full_name, p.email,
          left(regexp_replace(coalesce(s.body,''), '\s+', ' ', 'g'), 400) as answer,
          s.links::text as links, s.ai_score,
          left(regexp_replace(coalesce(s.ai_feedback_md,''), '\s+', ' ', 'g'), 500) as feedback,
          array_to_string(s.ai_strengths, ' | ') as strengths,
          array_to_string(s.ai_weaknesses, ' | ') as weaknesses
   from assignment_submissions s join profiles p on p.id=s.user_id
   where s.assignment_id='<ID>'
     and (coalesce(s.body,'')<>'' or jsonb_array_length(coalesce(s.links,'[]'::jsonb))>0)
   order by s.ai_score desc nulls last, p.full_name
   limit 25 offset <N>;
   ```
   Accumulate all rows (keep paging until <25 returned). Build CSV in memory.
3. CSV columns (header row exactly):
   `Name,Email,Score /10,Score %,Answer (trimmed),Links,AI Comments,Strengths,Weaknesses`
   - Score /10 = round(ai_score/10,1); Score % = ai_score.
   - CSV-quote every field: wrap in double quotes, double any internal quotes, strip newlines (already collapsed).
   - Sort rows by Score % desc (the query does this).
4. Put the rubric reference as the FIRST data row group: before the student rows, emit two lines:
   line A: `"RUBRIC (reference) — <title>",,,,,"<rubric reference string>",,,`
   line B: a blank separator row of commas.
   Then the header row, then student rows. (So opening the sheet shows the rubric on top.)
5. Create the sheet:
   create_file(title="Day <DAY> · <short title>", parentId=FOLDER_ID,
               contentMimeType="text/csv", textContent=<the CSV>)
   Note: pass parentId=FOLDER_ID so it lands in the shared folder.

## Return (compact)
- assignment title, the created sheet id + viewUrl (or title if no url), row count (students), and any rows skipped.
- Do NOT paste answers/feedback.
