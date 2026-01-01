/**
 * SourcegraphExplorer agent factory.
 */

import type { AgentBuilder, LLMist } from "llmist";
import { sourcegraphGadgets } from "./gadgets/index.js";
import { SOURCEGRAPH_SYSTEM_PROMPT } from "./system-prompt.js";

export type { LLMist, AgentBuilder };

/**
 * Creates a pre-configured agent for exploring code via Sourcegraph.
 *
 * The agent comes with all Sourcegraph gadgets and an optimized system
 * prompt that explains query syntax and best practices.
 *
 * @param client - LLMist client instance
 * @returns Configured AgentBuilder ready for use
 *
 * @example
 * ```typescript
 * import { LLMist } from 'llmist';
 * import { createSourcegraphExplorer } from 'sourcegraph-search-gadget';
 *
 * const client = new LLMist();
 * const result = await createSourcegraphExplorer(client)
 *   .withModel('sonnet')
 *   .askAndCollect('Find how React implements useState');
 * ```
 *
 * @example
 * ```typescript
 * // Streaming usage
 * const agent = createSourcegraphExplorer(client)
 *   .withModel('sonnet')
 *   .ask('Explore the TypeScript compiler architecture');
 *
 * for await (const event of agent.run()) {
 *   if (event.type === 'text') {
 *     process.stdout.write(event.content);
 *   }
 * }
 * ```
 */
export function createSourcegraphExplorer(client: LLMist): AgentBuilder {
	return client
		.createAgent()
		.withSystem(SOURCEGRAPH_SYSTEM_PROMPT)
		.withGadgets(...sourcegraphGadgets)
		.withMaxIterations(15);
}
