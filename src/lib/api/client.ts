export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
	}
}

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export type ApiRequestInit = Omit<RequestInit, 'body'> & { body?: unknown };

export async function request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
	const fetchInit = { ...init } as RequestInit;

	if (init.body !== undefined && typeof init.body === 'object') {
		fetchInit.body = JSON.stringify(init.body);
		fetchInit.headers = {
			...(init.headers as Record<string, string> | undefined),
			'Content-Type': 'application/json'
		};
	}

	const response = await fetch(`${API_BASE_URL}${path}`, fetchInit);

	if (!response.ok) {
		let message = `HTTP ${response.status}`;
		try {
			const data = await response.json();
			if (typeof data?.message === 'string') message = data.message;
		} catch {
			/* empty */
		}
		throw new ApiError(response.status, message);
	}

	if (response.status === 204) return undefined as T;
	return (await response.json()) as T;
}
