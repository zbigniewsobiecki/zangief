/**
 * Export all Sourcegraph gadgets.
 */

export { sourcegraphCommitSearch } from "./commit-search.js";
export { sourcegraphGetFile } from "./get-file.js";
export { sourcegraphListRepos } from "./list-repos.js";
export { sourcegraphSearch } from "./search.js";

import { sourcegraphCommitSearch } from "./commit-search.js";
import { sourcegraphGetFile } from "./get-file.js";
import { sourcegraphListRepos } from "./list-repos.js";
import { sourcegraphSearch } from "./search.js";

/**
 * Array of all Sourcegraph gadgets for easy registration.
 *
 * @example
 * ```typescript
 * import { sourcegraphGadgets } from 'sourcegraph-search-gadget';
 *
 * const agent = LLMist.createAgent()
 *   .withGadgets(...sourcegraphGadgets)
 *   .ask('Search for React hooks');
 * ```
 */
export const sourcegraphGadgets = [
	sourcegraphSearch,
	sourcegraphGetFile,
	sourcegraphListRepos,
	sourcegraphCommitSearch,
] as const;
