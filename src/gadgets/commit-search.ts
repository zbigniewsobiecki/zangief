/**
 * SourcegraphCommitSearch gadget - Search commits and diffs.
 */

import { createGadget, z } from "llmist";
import { sourcegraphQuery } from "../client.js";
import type { SearchResult } from "../types.js";
import { isCommitMatch } from "../types.js";
import { formatCommitMatch } from "../utils/format.js";

const COMMIT_SEARCH_QUERY = `
query CommitSearch($query: String!) {
  search(query: $query, version: V3) {
    results {
      matchCount
      limitHit
      results {
        __typename
        ... on CommitSearchResult {
          commit {
            oid
            abbreviatedOID
            message
            subject
            body
            author {
              person { displayName email }
              date
            }
            url
            repository { name url }
          }
          matches {
            body {
              text
            }
          }
        }
      }
    }
  }
}
`;

export const sourcegraphCommitSearch = createGadget({
	name: "SourcegraphCommitSearch",
	description: `Search through commit messages and diffs.

**Search types:**
- \`type:commit\` - Search commit messages
- \`type:diff\` - Search code changes (diffs)

**Additional filters:**
- \`repo:github.com/org/repo\` - Limit to specific repo
- \`author:name\` - Filter by commit author
- \`before:"1 week ago"\` - Commits before a date
- \`after:"2024-01-01"\` - Commits after a date
- \`message:"pattern"\` - Search commit message text`,
	timeoutMs: 20000,
	schema: z.object({
		query: z
			.string()
			.min(1)
			.describe("Search query. Include 'type:commit' or 'type:diff' for best results."),
		maxResults: z
			.number()
			.int()
			.min(1)
			.max(50)
			.optional()
			.default(20)
			.describe("Maximum results to return (1-50, default 20)"),
	}),
	examples: [
		{
			params: { query: "type:commit fix security repo:github.com/facebook/react", maxResults: 20 },
			comment: "Find security-related commits in React",
		},
		{
			params: {
				query: "type:diff useState repo:github.com/facebook/react after:2024-01-01",
				maxResults: 20,
			},
			comment: "Find recent changes to useState in React",
		},
		{
			params: { query: "type:commit author:torvalds", maxResults: 10 },
			comment: "Find commits by Linus Torvalds",
		},
	],
	execute: async ({ query, maxResults }) => {
		// Ensure type:commit or type:diff is included
		let fullQuery = query;
		if (!query.includes("type:commit") && !query.includes("type:diff")) {
			fullQuery = `type:commit ${query}`;
		}

		// Add count filter
		if (!query.includes("count:")) {
			fullQuery = `${fullQuery} count:${maxResults}`;
		}

		const data = await sourcegraphQuery<SearchResult>(COMMIT_SEARCH_QUERY, {
			query: fullQuery,
		});

		const results = data.search.results;
		const commits = results.results.filter(isCommitMatch);

		if (commits.length === 0) {
			return `No commits found for: "${query}"\n\nTip: Make sure to include 'type:commit' or 'type:diff' in your query.`;
		}

		const lines: string[] = [];

		// Header
		const limitNote = results.limitHit ? " (limit reached)" : "";
		lines.push(`Commit search results for "${query}" (${results.matchCount} matches${limitNote})`);
		lines.push("");

		// Format each commit
		commits.forEach((commit, index) => {
			lines.push(formatCommitMatch(commit, index + 1));
			lines.push("");
		});

		return lines.join("\n");
	},
});
