import { request } from '$lib/api/client';
import type { School, SchoolInput } from './schools.types';

export function listSchools(): Promise<School[]> {
	return request<School[]>('/schools');
}

export function createSchool(data: SchoolInput): Promise<School> {
	return request<School>('/schools', { method: 'POST', body: data });
}

export function updateSchool(id: number, data: SchoolInput): Promise<School> {
	return request<School>(`/schools/${id}`, { method: 'PUT', body: data });
}

export function deleteSchool(id: number): Promise<void> {
	return request<void>(`/schools/${id}`, { method: 'DELETE' });
}
