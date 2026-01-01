/**
 * Sourcegraph GraphQL API client.
 */

const SOURCEGRAPH_API_URL = "https://sourcegraph.com/.api/graphql";
const DEFAULT_TIMEOUT_MS = 15000;

export interface GraphQLResponse<T> {
	data?: T;
	errors?: Array<{
		message: string;
		path?: string[];
		extensions?: Record<string, unknown>;
	}>;
}

export class SourcegraphClientError extends Error {
	constructor(
		message: string,
		public readonly statusCode?: number,
		public readonly graphqlErrors?: Array<{ message: string }>,
	) {
		super(message);
		this.name = "SourcegraphClientError";
	}
}

function getApiKey(): string {
	const key = process.env.SOURCEGRAPH_API_KEY;
	if (!key) {
		throw new SourcegraphClientError(
			"SOURCEGRAPH_API_KEY environment variable is not set. " +
				"Get an access token from https://sourcegraph.com/users/settings/tokens",
		);
	}
	return key;
}

export async function sourcegraphQuery<T>(
	query: string,
	variables?: Record<string, unknown>,
	timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
	const apiKey = getApiKey();

	const abortController = new AbortController();
	const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

	try {
		const response = await fetch(SOURCEGRAPH_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `token ${apiKey}`,
			},
			body: JSON.stringify({ query, variables }),
			signal: abortController.signal,
		});

		if (!response.ok) {
			throw new SourcegraphClientError(
				`Sourcegraph API request failed: ${response.status} ${response.statusText}`,
				response.status,
			);
		}

		const result: GraphQLResponse<T> = await response.json();

		if (result.errors && result.errors.length > 0) {
			throw new SourcegraphClientError(
				`GraphQL errors: ${result.errors.map((e) => e.message).join("; ")}`,
				undefined,
				result.errors,
			);
		}

		if (!result.data) {
			throw new SourcegraphClientError("No data returned from Sourcegraph API");
		}

		return result.data;
	} catch (error) {
		if (error instanceof SourcegraphClientError) {
			throw error;
		}
		if (error instanceof Error && error.name === "AbortError") {
			throw new SourcegraphClientError(
				`Sourcegraph API request timed out after ${timeoutMs / 1000} seconds`,
			);
		}
		throw new SourcegraphClientError(
			`Sourcegraph API request failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	} finally {
		clearTimeout(timeoutId);
	}
}
