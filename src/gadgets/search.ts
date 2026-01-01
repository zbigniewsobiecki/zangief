/**
 * SourcegraphSearch gadget - Search code across public GitHub repos.
 */

import { createGadget, z } from "llmist";
import { sourcegraphQuery } from "../client.js";
import type { SearchResult } from "../types.js";
import { isCommitMatch, isFileMatch, isRepoMatch } from "../types.js";
import { formatCommitMatch, formatFileMatch, formatRepoMatch } from "../utils/format.js";

const SEARCH_QUERY = `
query Search($query: String!) {
  search(query: $query, version: V3) {
    results {
      matchCount
      limitHit
      cloning { name }
      missing { name }
      timedout { name }
      results {
        __typename
        ... on FileMatch {
          repository { name url }
          file { path url }
          lineMatches {
            lineNumber
            preview
            offsetAndLengths
          }
          chunkMatches {
            content
            contentStart { line }
            ranges {
              start { line }
              end { line }
            }
          }
        }
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
        ... on Repository {
          name
          url
          description
        }
      }
    }
  }
}
`;

export const sourcegraphSearch = createGadget({
	name: "SourcegraphSearch",
	description: `Search code across public GitHub repositories using Sourcegraph.

**Query Syntax:**
- \`repo:github.com/org/repo\` - Search in specific repo
- \`repo:^github.com/org/\` - Regex match repos (e.g., all repos in org)
- \`lang:typescript\` - Filter by language
- \`file:*.ts\` - Filter by file pattern
- \`type:symbol\` - Search symbols (functions, classes)
- \`type:commit\` - Search commit messages
- \`type:diff\` - Search diffs
- \`case:yes\` - Case sensitive search
- \`count:N\` - Return up to N results

**Examples:**
- \`createGadget lang:typescript\` - Find TypeScript code
- \`repo:github.com/facebook/react useState\` - Search in React repo
- \`file:package.json "react"\` - Find package.json files mentioning react`,
	timeoutMs: 15000,
	schema: z.object({
		query: z
			.string()
			.min(1)
			.describe("Sourcegraph search query. Use filters like repo:, lang:, file: for precision."),
		maxResults: z
			.number()
			.int()
			.min(1)
			.max(100)
			.optional()
			.default(25)
			.describe("Maximum number of results to return (1-100, default 25)"),
	}),
	examples: [
		{
			params: { query: "createGadget lang:typescript", maxResults: 10 },
			comment: "Search for TypeScript code containing 'createGadget'",
		},
		{
			params: { query: "repo:github.com/facebook/react useState file:*.ts", maxResults: 25 },
			comment: "Search React repo for useState in TypeScript files",
		},
		{
			params: { query: "type:commit fix bug", maxResults: 20 },
			comment: "Search commit messages for bug fixes",
		},
	],
	execute: async ({ query, maxResults }) => {
		// Add count filter if not already present
		let fullQuery = query;
		if (!query.includes("count:")) {
			fullQuery = `${query} count:${maxResults}`;
		}

		const data = await sourcegraphQuery<SearchResult>(SEARCH_QUERY, { query: fullQuery });

		const results = data.search.results;

		if (results.results.length === 0) {
			let message = `No results found for: "${query}"`;
			if (results.cloning.length > 0) {
				message += `\n\nNote: ${results.cloning.length} repositories are still being cloned.`;
			}
			if (results.timedout.length > 0) {
				message += `\n\nNote: ${results.timedout.length} repositories timed out.`;
			}
			return message;
		}

		const lines: string[] = [];

		// Header
		const limitNote = results.limitHit ? " (limit reached)" : "";
		lines.push(`Search results for "${query}" (${results.matchCount} matches${limitNote})`);
		lines.push("");

		// Format each result
		let index = 1;
		for (const result of results.results) {
			if (isFileMatch(result)) {
				lines.push(formatFileMatch(result, index));
			} else if (isCommitMatch(result)) {
				lines.push(formatCommitMatch(result, index));
			} else if (isRepoMatch(result)) {
				lines.push(formatRepoMatch(result, index));
			}
			lines.push("");
			index++;
		}

		// Warnings
		if (results.cloning.length > 0) {
			lines.push(`Note: ${results.cloning.length} repositories are still being cloned.`);
		}
		if (results.timedout.length > 0) {
			lines.push(`Note: ${results.timedout.length} repositories timed out.`);
		}
		if (results.missing.length > 0) {
			lines.push(`Note: ${results.missing.length} repositories are missing.`);
		}

		return lines.join("\n");
	},
});
