import { request } from '$lib/api/client';
import type { ClassInput, ClassRecord } from '../types/classes.types';

export function listClasses(): Promise<ClassRecord[]> {
	return request<ClassRecord[]>('/classes');
}

export function createClass(data: ClassInput): Promise<ClassRecord> {
	return request<ClassRecord>('/classes', { method: 'POST', body: data });
}

export function updateClass(id: number, data: ClassInput): Promise<ClassRecord> {
	return request<ClassRecord>(`/classes/${id}`, { method: 'PUT', body: data });
}

export function deleteClass(id: number): Promise<void> {
	return request<void>(`/classes/${id}`, { method: 'DELETE' });
}
