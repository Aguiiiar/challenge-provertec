import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import * as schoolsApi from '$lib/features/schools/api/schools.api';
import * as classesApi from '$lib/features/classes/api/classes.api';
import Page from './+page.svelte';
import type { ClassRecord } from '../../lib/features/classes/types/classes.types';

vi.mock('./schools.api', () => ({
	listSchools: vi.fn(),
	createSchool: vi.fn(),
	updateSchool: vi.fn(),
	deleteSchool: vi.fn()
}));

vi.mock('../classes/classes.api', () => ({
	listClasses: vi.fn()
}));

const schools = [
	{
		id: 1,
		name: 'EMEF Monteiro Lobato',
		address: 'Rua A, 10',
		city: 'São Paulo',
		phone: '11987654321',
		email: 'a@b.gov.br',
		director: 'Ana'
	},
	{
		id: 2,
		name: 'EMEF Paulo Freire',
		address: 'Rua B, 20',
		city: 'Santos',
		phone: '13987654321',
		email: 'c@d.gov.br',
		director: 'Bruno'
	}
];

const classes: ClassRecord[] = [
	{
		id: 1,
		schoolId: 1,
		name: '1º Ano A',
		grade: '1º Ano',
		shift: 'morning',
		teacher: 'X',
		capacity: 30
	},
	{
		id: 2,
		schoolId: 1,
		name: '2º Ano B',
		grade: '2º Ano',
		shift: 'afternoon',
		teacher: 'Y',
		capacity: 28
	}
];

function mockLoad() {
	vi.mocked(schoolsApi.listSchools).mockResolvedValue(schools);
	vi.mocked(classesApi.listClasses).mockResolvedValue(classes);
}

describe('Schools page', () => {
	it('renders the toolbar and one row per school with class counts', async () => {
		mockLoad();
		render(Page);

		await expect.element(page.getByRole('button', { name: 'Adicionar escola' })).toBeVisible();
		await expect.element(page.getByText('EMEF Monteiro Lobato')).toBeVisible();
		await expect.element(page.getByText('EMEF Paulo Freire')).toBeVisible();
		await expect.element(page.getByText('2', { exact: true })).toBeVisible();
		await expect.element(page.getByText('0', { exact: true })).toBeVisible();
	});

	it('filters rows by search (name or city)', async () => {
		mockLoad();
		render(Page);

		await page.getByRole('searchbox', { name: 'Buscar por nome ou cidade' }).fill('santos');
		await expect.element(page.getByText('EMEF Monteiro Lobato')).not.toBeInTheDocument();
		await expect.element(page.getByText('EMEF Paulo Freire')).toBeVisible();
	});

	it('filters rows by city dropdown', async () => {
		mockLoad();
		render(Page);

		await page.getByRole('combobox', { name: 'Cidade' }).selectOptions('Santos');
		await expect.element(page.getByText('EMEF Monteiro Lobato')).not.toBeInTheDocument();
		await expect.element(page.getByText('EMEF Paulo Freire')).toBeVisible();
	});

	it('shows the empty state when no school matches', async () => {
		mockLoad();
		render(Page);

		await page.getByRole('searchbox', { name: 'Buscar por nome ou cidade' }).fill('não existe');
		await expect.element(page.getByText('Nenhuma escola encontrada')).toBeVisible();
	});

	it('shows an error state with retry when the API fails', async () => {
		vi.mocked(schoolsApi.listSchools).mockRejectedValue(new Error('boom'));
		render(Page);

		await expect.element(page.getByText(/Não foi possível carregar as escolas/)).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
	});
});
describe('Schools page — delete', () => {
	it('blocks deleting a school that has classes', async () => {
		mockLoad();
		render(Page);

		await page.getByRole('button', { name: 'Excluir EMEF Monteiro Lobato' }).click();

		await expect.element(page.getByText(/possui 2 turma/)).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Excluir', exact: true }))
			.not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Fechar' })).toBeVisible();
		expect(vi.mocked(schoolsApi.deleteSchool)).not.toHaveBeenCalled();
	});

	it('deletes a school without classes after confirmation', async () => {
		mockLoad();
		vi.mocked(schoolsApi.deleteSchool).mockResolvedValue(undefined);
		render(Page);

		await page.getByRole('button', { name: 'Excluir EMEF Paulo Freire' }).click();
		await page.getByRole('button', { name: 'Excluir', exact: true }).click();

		await vi.waitFor(() => expect(vi.mocked(schoolsApi.deleteSchool)).toHaveBeenCalledWith(2));
		await expect.element(page.getByText('EMEF Paulo Freire')).not.toBeInTheDocument();
	});
});
