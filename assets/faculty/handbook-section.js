// Handbook: quick FAQ (handbook.js). Pre-training lives in the Training section.

import { renderHandbook } from './handbook.js';

/**
 * @param {{ state: object, container: HTMLElement }} ctx
 */
export async function renderHandbookSection(ctx) {
  await renderHandbook(ctx);
}
