export const MIN_SUBMISSION_WORDS = 100;
export const MAX_SUBMISSION_WORDS = 1000;

export function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
