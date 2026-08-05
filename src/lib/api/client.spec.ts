import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, request } from './client';

function mockFetch(response: { status: number; body?: unknown }) {
	return vi.fn().mockResolvedValue({
		ok: response.status >= 200 && response.status < 300,
		status: response.status,
		json: async () => response.body
	});
}

afterEach(() => vi.unstubAllGlobals());

describe('request', () => {
	it('GETs from the base URL and parses JSON', async () => {
		const fetchMock = mockFetch({ status: 200, body: [{ id: 1 }] });
		vi.stubGlobal('fetch', fetchMock);

		const result = await request<{ id: number }[]>('/schools');

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/schools', {});
		expect(result).toEqual([{ id: 1 }]);
	});

	it('serializes object bodies as JSON with content-type header', async () => {
		const fetchMock = mockFetch({ status: 201, body: { id: 7 } });
		vi.stubGlobal('fetch', fetchMock);

		await request('/schools', { method: 'POST', body: { nome: 'X' } });

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/schools', {
			method: 'POST',
			body: '{"nome":"X"}',
			headers: { 'Content-Type': 'application/json' }
		});
	});

	it('throws ApiError with status on non-OK responses', async () => {
		vi.stubGlobal('fetch', mockFetch({ status: 404, body: {} }));

		await expect(request('/schools/999')).rejects.toThrow(ApiError);
		await expect(request('/schools/999')).rejects.toMatchObject({ status: 404 });
	});

	it('returns undefined for 204 responses', async () => {
		vi.stubGlobal('fetch', mockFetch({ status: 204 }));

		await expect(request<void>('/schools/1', { method: 'DELETE' })).resolves.toBeUndefined();
	});
});
