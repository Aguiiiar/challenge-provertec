import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '$lib/api/client';
import { createSchool, deleteSchool, listSchools, updateSchool } from './schools.api';

const schoolInput = {
	name: 'EMEF Nova',
	address: 'Rua B, 2',
	city: 'Santos',
	phone: '13999998888',
	email: 'nova@teste.gov.br',
	director: 'Maria'
};

function mockFetch(response: { status: number; body?: unknown }) {
	return vi.fn().mockResolvedValue({
		ok: response.status >= 200 && response.status < 300,
		status: response.status,
		json: async () => response.body
	});
}

afterEach(() => vi.unstubAllGlobals());

describe('schools.api', () => {
	it('listSchools GETs /schools', async () => {
		const fetchMock = mockFetch({ status: 200, body: [{ id: 1, ...schoolInput }] });
		vi.stubGlobal('fetch', fetchMock);

		const schools = await listSchools();

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/schools', {});
		expect(schools).toEqual([{ id: 1, ...schoolInput }]);
	});

	it('createSchool POSTs the input', async () => {
		const fetchMock = mockFetch({ status: 201, body: { id: 7, ...schoolInput } });
		vi.stubGlobal('fetch', fetchMock);

		const school = await createSchool(schoolInput);

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/schools', {
			method: 'POST',
			body: JSON.stringify(schoolInput),
			headers: { 'Content-Type': 'application/json' }
		});
		expect(school.id).toBe(7);
	});

	it('updateSchool PUTs to /schools/:id', async () => {
		const fetchMock = mockFetch({ status: 200, body: { id: 3, ...schoolInput } });
		vi.stubGlobal('fetch', fetchMock);

		await updateSchool(3, schoolInput);

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/schools/3', {
			method: 'PUT',
			body: JSON.stringify(schoolInput),
			headers: { 'Content-Type': 'application/json' }
		});
	});

	it('deleteSchool DELETEs /schools/:id', async () => {
		const fetchMock = mockFetch({ status: 204, body: undefined });
		vi.stubGlobal('fetch', fetchMock);

		await expect(deleteSchool(9)).resolves.toBeUndefined();

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/schools/9', {
			method: 'DELETE'
		});
	});

	it('propagates ApiError on failure', async () => {
		vi.stubGlobal('fetch', mockFetch({ status: 500, body: {} }));

		await expect(listSchools()).rejects.toBeInstanceOf(ApiError);
	});
});
