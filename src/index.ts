/**
 * Sourcegraph Search Gadget for llmist
 *
 * Explore GitHub public repositories via Sourcegraph's powerful code search API.
 *
 * @example
 * ```typescript
 * import { LLMist } from 'llmist';
 * import { createSourcegraphExplorer } from 'sourcegraph-search-gadget';
 *
 * const client = new LLMist();
 * const result = await createSourcegraphExplorer(client)
 *   .withModel('sonnet')
 *   .askAndCollect('Find how React implements hooks');
 * ```
 *
 * @example
 * ```typescript
 * // Custom agent with individual gadgets
 * import { sourcegraphGadgets, sourcegraphSearch } from 'sourcegraph-search-gadget';
 *
 * const agent = LLMist.createAgent()
 *   .withGadgets(...sourcegraphGadgets)  // All gadgets
 *   // or
 *   .withGadgets(sourcegraphSearch)  // Just search
 * ```
 *
 * @packageDocumentation
 */

// Agent factory
export { createSourcegraphExplorer } from "./agent.js";
// Client utilities
export { SourcegraphClientError, sourcegraphQuery } from "./client.js";
// All gadgets as array
// Individual gadgets
export {
	sourcegraphCommitSearch,
	sourcegraphGadgets,
	sourcegraphGetFile,
	sourcegraphListRepos,
	sourcegraphSearch,
} from "./gadgets/index.js";
// System prompt
export { SOURCEGRAPH_SYSTEM_PROMPT } from "./system-prompt.js";
// Types for advanced usage
export type {
	CommitMatch,
	FileContentResult,
	FileMatch,
	RepoMatch,
	RepositoryListResult,
	SearchResult,
} from "./types.js";
