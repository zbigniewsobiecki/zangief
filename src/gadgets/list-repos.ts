/**
 * SourcegraphListRepos gadget - List and search repositories.
 */

import { createGadget, z } from "llmist";
import { sourcegraphQuery } from "../client.js";
import type { RepositoryListResult } from "../types.js";
import { formatRepository } from "../utils/format.js";

const REPOSITORY_LIST_QUERY = `
query Repositories($query: String, $first: Int!) {
  repositories(query: $query, first: $first) {
    nodes {
      name
      description
      url
      externalURLs { url serviceKind }
      defaultBranch { name }
    }
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;

export const sourcegraphListRepos = createGadget({
  name: "SourcegraphListRepos",
  description: `List and search repositories indexed by Sourcegraph.

Use this to discover repositories before searching their code.

**Query tips:**
- Leave query empty to list popular repos
- Use partial names to filter (e.g., "react" finds repos with "react" in the name)
- Use \`github.com/org/\` pattern to find repos in an org`,
  timeoutMs: 15000,
  schema: z.object({
    query: z
      .string()
      .optional()
      .describe("Filter repositories by name pattern (optional)"),
    maxResults: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .describe("Maximum repositories to return (1-100, default 20)"),
  }),
  examples: [
    {
      params: { query: "github.com/facebook/", maxResults: 10 },
      comment: "List repositories from Facebook's GitHub org",
    },
    {
      params: { query: "typescript compiler", maxResults: 20 },
      comment: "Find repositories related to TypeScript compilers",
    },
  ],
  execute: async ({ query, maxResults }) => {
    const data = await sourcegraphQuery<RepositoryListResult>(REPOSITORY_LIST_QUERY, {
      query: query || "",
      first: maxResults,
    });

    const repos = data.repositories.nodes;

    if (repos.length === 0) {
      return query
        ? `No repositories found matching: "${query}"`
        : "No repositories found.";
    }

    const lines: string[] = [];

    // Header
    const queryNote = query ? ` matching "${query}"` : "";
    const hasMore = data.repositories.pageInfo.hasNextPage;
    const moreNote = hasMore
      ? ` (showing ${repos.length} of ${data.repositories.totalCount})`
      : "";
    lines.push(`Repositories${queryNote}${moreNote}:`);
    lines.push("");

    // Format each repository
    repos.forEach((repo, index) => {
      lines.push(formatRepository(repo, index + 1));
      lines.push("");
    });

    if (hasMore) {
      lines.push(
        `Note: More repositories available. Increase maxResults or refine your query.`,
      );
    }

    return lines.join("\n");
  },
});
