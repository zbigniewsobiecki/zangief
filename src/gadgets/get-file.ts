/**
 * SourcegraphGetFile gadget - Fetch file contents from a repository.
 */

import { createGadget, z } from "llmist";
import { sourcegraphQuery } from "../client.js";
import type { FileContentResult } from "../types.js";
import { formatFileContent } from "../utils/format.js";

const FILE_CONTENT_QUERY = `
query FileContent($repo: String!, $path: String!, $rev: String!) {
  repository(name: $repo) {
    commit(rev: $rev) {
      file(path: $path) {
        content
        byteSize
      }
    }
  }
}
`;

export const sourcegraphGetFile = createGadget({
  name: "SourcegraphGetFile",
  description: `Fetch the full content of a file from a repository on Sourcegraph.

Use this after finding a file with SourcegraphSearch to read its complete contents.

**Repository format:** \`github.com/org/repo\` (without https://)`,
  timeoutMs: 15000,
  schema: z.object({
    repo: z
      .string()
      .min(1)
      .describe("Repository path (e.g., 'github.com/facebook/react')"),
    path: z.string().min(1).describe("File path within the repository (e.g., 'src/index.ts')"),
    revision: z
      .string()
      .optional()
      .default("HEAD")
      .describe("Git revision: branch, tag, or commit hash (default: HEAD)"),
  }),
  examples: [
    {
      params: { repo: "github.com/facebook/react", path: "packages/react/src/React.js", revision: "HEAD" },
      comment: "Read React.js source file from React repo",
    },
    {
      params: {
        repo: "github.com/microsoft/typescript",
        path: "src/compiler/checker.ts",
        revision: "main",
      },
      comment: "Read TypeScript compiler source from main branch",
    },
  ],
  execute: async ({ repo, path, revision }) => {
    const data = await sourcegraphQuery<FileContentResult>(FILE_CONTENT_QUERY, {
      repo,
      path,
      rev: revision,
    });

    if (!data.repository) {
      return `Error: Repository "${repo}" not found on Sourcegraph.`;
    }

    if (!data.repository.commit) {
      return `Error: Revision "${revision}" not found in repository "${repo}".`;
    }

    if (!data.repository.commit.file) {
      return `Error: File "${path}" not found in ${repo}@${revision}.`;
    }

    const { content, byteSize } = data.repository.commit.file;

    return formatFileContent(repo, path, content, byteSize);
  },
});
