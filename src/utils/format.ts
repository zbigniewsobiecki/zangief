/**
 * Output formatting utilities for Sourcegraph search results.
 */

import { formatBytes, formatDate } from "llmist";
import type { FileMatch, CommitMatch, RepoMatch } from "../types.js";

const SOURCEGRAPH_BASE_URL = "https://sourcegraph.com";

/**
 * Format a file match with detailed output.
 */
export function formatFileMatch(match: FileMatch, index: number): string {
  const lines: string[] = [];

  lines.push(`${index}. ${match.repository.name}`);
  lines.push(`   File: ${match.file.path}`);
  lines.push(`   URL: ${SOURCEGRAPH_BASE_URL}${match.file.url}`);
  lines.push("");

  // Format line matches
  if (match.lineMatches && match.lineMatches.length > 0) {
    for (const lineMatch of match.lineMatches.slice(0, 10)) {
      const lineNum = String(lineMatch.lineNumber).padStart(4, " ");
      const preview = lineMatch.preview.trimEnd();
      lines.push(`   L${lineNum}: ${preview}`);
    }
    if (match.lineMatches.length > 10) {
      lines.push(`   ... and ${match.lineMatches.length - 10} more matches`);
    }
  }

  // Format chunk matches (alternative format)
  if (match.chunkMatches && match.chunkMatches.length > 0 && !match.lineMatches?.length) {
    for (const chunk of match.chunkMatches.slice(0, 3)) {
      const startLine = chunk.contentStart.line;
      const contentLines = chunk.content.split("\n");
      for (let i = 0; i < Math.min(contentLines.length, 5); i++) {
        const lineNum = String(startLine + i).padStart(4, " ");
        lines.push(`   L${lineNum}: ${contentLines[i]}`);
      }
      if (contentLines.length > 5) {
        lines.push(`   ... (${contentLines.length - 5} more lines)`);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Format a commit match with detailed output.
 */
export function formatCommitMatch(match: CommitMatch, index: number): string {
  const lines: string[] = [];
  const commit = match.commit;

  lines.push(`${index}. ${commit.repository.name}`);
  lines.push(`   Commit: ${commit.abbreviatedOID}`);
  lines.push(`   Author: ${commit.author.person.displayName} <${commit.author.person.email}>`);
  lines.push(`   Date: ${formatDate(commit.author.date)}`);
  lines.push(`   URL: ${SOURCEGRAPH_BASE_URL}${commit.url}`);
  lines.push("");
  lines.push(`   ${commit.subject}`);

  if (commit.body) {
    const bodyLines = commit.body.split("\n").slice(0, 3);
    for (const line of bodyLines) {
      if (line.trim()) {
        lines.push(`   ${line}`);
      }
    }
  }

  // Show diff matches if available
  if (match.matches && match.matches.length > 0) {
    lines.push("");
    lines.push("   Diff:");
    for (const m of match.matches.slice(0, 2)) {
      const diffLines = m.body.text.split("\n").slice(0, 5);
      for (const line of diffLines) {
        lines.push(`     ${line}`);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Format a repository match.
 */
export function formatRepoMatch(match: RepoMatch, index: number): string {
  const lines: string[] = [];

  lines.push(`${index}. ${match.name}`);
  lines.push(`   URL: ${SOURCEGRAPH_BASE_URL}${match.url}`);
  if (match.description) {
    lines.push(`   ${match.description}`);
  }

  return lines.join("\n");
}

/**
 * Format repository from listing.
 */
export function formatRepository(
  repo: {
    name: string;
    description: string;
    url: string;
    externalURLs: Array<{ url: string; serviceKind: string }>;
    defaultBranch: { name: string } | null;
  },
  index: number,
): string {
  const lines: string[] = [];

  lines.push(`${index}. ${repo.name}`);
  lines.push(`   Sourcegraph: ${SOURCEGRAPH_BASE_URL}${repo.url}`);

  // Add external URL (e.g., GitHub)
  const githubUrl = repo.externalURLs.find((u) => u.serviceKind === "GITHUB");
  if (githubUrl) {
    lines.push(`   GitHub: ${githubUrl.url}`);
  }

  if (repo.defaultBranch) {
    lines.push(`   Default branch: ${repo.defaultBranch.name}`);
  }

  if (repo.description) {
    lines.push(`   ${repo.description}`);
  }

  return lines.join("\n");
}

/**
 * Format file content result.
 */
export function formatFileContent(
  repo: string,
  path: string,
  content: string,
  byteSize: number,
): string {
  const lines: string[] = [];

  lines.push(`Repository: ${repo}`);
  lines.push(`File: ${path}`);
  lines.push(`Size: ${formatBytes(byteSize)}`);
  lines.push(`URL: ${SOURCEGRAPH_BASE_URL}/${repo}/-/blob/${path}`);
  lines.push("");
  lines.push("─".repeat(60));
  lines.push("");

  // Limit content to avoid overwhelming the context
  const maxLines = 500;
  const contentLines = content.split("\n");
  if (contentLines.length > maxLines) {
    lines.push(contentLines.slice(0, maxLines).join("\n"));
    lines.push("");
    lines.push(`... (${contentLines.length - maxLines} more lines truncated)`);
  } else {
    lines.push(content);
  }

  return lines.join("\n");
}

