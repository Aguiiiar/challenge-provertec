import { afterEach, describe, expect, it, vi } from 'vitest';
import { createClass, deleteClass, listClasses, updateClass } from './classes.api';

const classInput = {
	schoolId: 1,
	name: '2º Ano B',
	grade: '2º Ano',
	shift: 'afternoon',
	teacher: 'Roberto',
	capacity: 28
} as const;

function mockFetch(response: { status: number; body?: unknown }) {
	return vi.fn().mockResolvedValue({
		ok: response.status >= 200 && response.status < 300,
		status: response.status,
		json: async () => response.body
	});
}

afterEach(() => vi.unstubAllGlobals());

describe('classes.api', () => {
	it('listClasses GETs /classes', async () => {
		const fetchMock = mockFetch({ status: 200, body: [{ id: 1, ...classInput }] });
		vi.stubGlobal('fetch', fetchMock);

		const classes = await listClasses();

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/classes', {});
		expect(classes).toEqual([{ id: 1, ...classInput }]);
	});

	it('createClass POSTs the input', async () => {
		const fetchMock = mockFetch({ status: 201, body: { id: 9, ...classInput } });
		vi.stubGlobal('fetch', fetchMock);

		const created = await createClass({ ...classInput });

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/classes', {
			method: 'POST',
			body: JSON.stringify({ ...classInput }),
			headers: { 'Content-Type': 'application/json' }
		});
		expect(created.id).toBe(9);
	});

	it('updateClass PUTs to /classes/:id', async () => {
		const fetchMock = mockFetch({ status: 200, body: { id: 5, ...classInput } });
		vi.stubGlobal('fetch', fetchMock);

		await updateClass(5, { ...classInput });

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/classes/5', {
			method: 'PUT',
			body: JSON.stringify({ ...classInput }),
			headers: { 'Content-Type': 'application/json' }
		});
	});

	it('deleteClass DELETEs /classes/:id', async () => {
		const fetchMock = mockFetch({ status: 204, body: undefined });
		vi.stubGlobal('fetch', fetchMock);

		await expect(deleteClass(9)).resolves.toBeUndefined();

		expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/classes/9', {
			method: 'DELETE'
		});
	});
});
