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

// System prompt
export { SOURCEGRAPH_SYSTEM_PROMPT } from "./system-prompt.js";

// All gadgets as array
export { sourcegraphGadgets } from "./gadgets/index.js";

// Individual gadgets
export {
  sourcegraphSearch,
  sourcegraphGetFile,
  sourcegraphListRepos,
  sourcegraphCommitSearch,
} from "./gadgets/index.js";

// Types for advanced usage
export type {
  SearchResult,
  FileMatch,
  CommitMatch,
  RepoMatch,
  FileContentResult,
  RepositoryListResult,
} from "./types.js";

// Client utilities
export { sourcegraphQuery, SourcegraphClientError } from "./client.js";
