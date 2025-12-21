/**
 * Demo of the SourcegraphExplorer agent.
 *
 * Run with: bun run examples/demo.ts
 *
 * Make sure SOURCEGRAPH_API_KEY is set in your environment or .env file.
 */

import { LLMist } from "llmist";
import { createSourcegraphExplorer } from "../src/index.js";

async function main() {
  // Check for API key
  if (!process.env.SOURCEGRAPH_API_KEY) {
    console.error("Error: SOURCEGRAPH_API_KEY environment variable is not set.");
    console.error("Get an access token from: https://sourcegraph.com/users/settings/tokens");
    process.exit(1);
  }

  const client = new LLMist();

  console.log("SourcegraphExplorer Demo");
  console.log("========================\n");

  // Create the explorer agent
  const agent = createSourcegraphExplorer(client)
    .withModel("sonnet")
    .ask("Find how the 'createGadget' function is implemented in the llmist library. Search for its definition and show me the key parts of the implementation.");

  // Stream the response
  console.log("Exploring code...\n");

  for await (const event of agent.run()) {
    switch (event.type) {
      case "text":
        process.stdout.write(event.content);
        break;

      case "gadget_call":
        // gadget_call has { call: ParsedGadgetCall } structure
        const call = (event as { call: { gadgetName: string } }).call;
        console.log(`\n[Calling ${call.gadgetName}...]\n`);
        break;

      case "gadget_result":
        // Results are processed by the LLM, don't print raw
        break;

      case "gadget_skipped":
        console.log(`\nGadget skipped: ${(event as { gadgetName: string }).gadgetName}`);
        break;
    }
  }

  console.log("\n\nDone!");
}

main().catch(console.error);
