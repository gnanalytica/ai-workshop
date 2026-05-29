export const MIN_SUBMISSION_WORDS = 100;
export const MAX_SUBMISSION_WORDS = 1000;

export function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Single source of truth for whether a submission is acceptable. Shared by the
 * client form (button-disable + toast) and the server action so the two never
 * drift. Rule: a link on its own is a valid submission (decks / repos / deployed
 * apps / recordings); a pure-text submission needs the full word minimum. Either
 * way it must stay under the max. Returns an error string, or null when OK.
 */
export function submissionError(body: string, hasLink: boolean): string | null {
  const words = countWords(body);
  if (words > MAX_SUBMISSION_WORDS) {
    return `Submission must be at most ${MAX_SUBMISSION_WORDS} words (currently ${words}).`;
  }
  if (hasLink) return null; // a link by itself is enough
  if (words < MIN_SUBMISSION_WORDS) {
    return `Submission needs at least ${MIN_SUBMISSION_WORDS} words, or attach a link (currently ${words}).`;
  }
  return null;
}
