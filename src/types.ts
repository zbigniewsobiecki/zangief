/**
 * TypeScript interfaces for Sourcegraph GraphQL API responses.
 */

// Search API types
export interface SearchResult {
	search: {
		results: {
			matchCount: number;
			limitHit: boolean;
			cloning: Array<{ name: string }>;
			missing: Array<{ name: string }>;
			timedout: Array<{ name: string }>;
			results: Array<FileMatch | CommitMatch | RepoMatch>;
		};
	};
}

export interface FileMatch {
	__typename: "FileMatch";
	repository: {
		name: string;
		url: string;
	};
	file: {
		path: string;
		url: string;
	};
	lineMatches: Array<{
		lineNumber: number;
		preview: string;
		offsetAndLengths: Array<[number, number]>;
	}>;
	chunkMatches?: Array<{
		content: string;
		contentStart: {
			line: number;
		};
		ranges: Array<{
			start: { line: number };
			end: { line: number };
		}>;
	}>;
}

export interface CommitMatch {
	__typename: "CommitSearchResult";
	commit: {
		oid: string;
		abbreviatedOID: string;
		message: string;
		subject: string;
		body: string | null;
		author: {
			person: {
				displayName: string;
				email: string;
			};
			date: string;
		};
		url: string;
		repository: {
			name: string;
			url: string;
		};
	};
	matches?: Array<{
		body: {
			text: string;
		};
	}>;
}

export interface RepoMatch {
	__typename: "Repository";
	name: string;
	url: string;
	description: string;
}

// File content API types
export interface FileContentResult {
	repository: {
		commit: {
			file: {
				content: string;
				byteSize: number;
				richHTML?: string;
			} | null;
		} | null;
	} | null;
}

// Repository listing API types
export interface RepositoryListResult {
	repositories: {
		nodes: Array<{
			name: string;
			description: string;
			url: string;
			externalURLs: Array<{
				url: string;
				serviceKind: string;
			}>;
			defaultBranch: {
				name: string;
			} | null;
		}>;
		totalCount: number;
		pageInfo: {
			hasNextPage: boolean;
			endCursor: string | null;
		};
	};
}

// Helper type guards
export function isFileMatch(result: FileMatch | CommitMatch | RepoMatch): result is FileMatch {
	return result.__typename === "FileMatch";
}

export function isCommitMatch(result: FileMatch | CommitMatch | RepoMatch): result is CommitMatch {
	return result.__typename === "CommitSearchResult";
}

export function isRepoMatch(result: FileMatch | CommitMatch | RepoMatch): result is RepoMatch {
	return result.__typename === "Repository";
}
