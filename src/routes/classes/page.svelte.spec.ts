import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import * as classesApi from './classes.api';
import * as schoolsApi from '../schools/schools.api';
import Page from './+page.svelte';

vi.mock('./classes.api', () => ({
	listClasses: vi.fn(),
	createClass: vi.fn(),
	updateClass: vi.fn(),
	deleteClass: vi.fn()
}));

vi.mock('../schools/schools.api', () => ({
	listSchools: vi.fn()
}));

const schools = [
	{
		id: 1,
		name: 'EMEF Monteiro Lobato',
		address: '',
		city: 'São Paulo',
		phone: '',
		email: '',
		director: ''
	},
	{
		id: 2,
		name: 'EMEF Paulo Freire',
		address: '',
		city: 'Santos',
		phone: '',
		email: '',
		director: ''
	}
];

const classes = [
	{
		id: 1,
		schoolId: 1,
		name: '1º Ano A',
		grade: '1º Ano',
		shift: 'morning',
		teacher: 'Fernanda',
		capacity: 30
	},
	{
		id: 2,
		schoolId: 2,
		name: '5º Ano A',
		grade: '5º Ano',
		shift: 'night',
		teacher: 'Luciana',
		capacity: 35
	}
] as const;

function mockLoad() {
	vi.mocked(classesApi.listClasses).mockResolvedValue([...classes]);
	vi.mocked(schoolsApi.listSchools).mockResolvedValue(schools);
}

describe('Classes page', () => {
	it('renders the toolbar and one row per class with the school name', async () => {
		mockLoad();
		render(Page);

		await expect.element(page.getByRole('button', { name: 'Adicionar turma' })).toBeVisible();
		await expect.element(page.getByText('1º Ano A')).toBeVisible();
		await expect.element(page.getByText('5º Ano A')).toBeVisible();
		await expect
			.element(page.getByRole('row', { name: /1º Ano A/ }).getByText('EMEF Monteiro Lobato'))
			.toBeVisible();
		await expect.element(page.getByText('Noturno')).toBeVisible();
	});

	it('filters rows by school dropdown', async () => {
		mockLoad();
		render(Page);

		await page.getByRole('combobox', { name: 'Escola' }).selectOptions('1');

		await expect.element(page.getByText('1º Ano A')).toBeVisible();
		await expect.element(page.getByText('5º Ano A')).not.toBeInTheDocument();
	});

	it('filters rows by search (name or teacher)', async () => {
		mockLoad();
		render(Page);

		await page.getByRole('searchbox', { name: 'Buscar por nome ou professor' }).fill('Luciana');

		await expect.element(page.getByText('1º Ano A')).not.toBeInTheDocument();
		await expect.element(page.getByText('5º Ano A')).toBeVisible();
	});

	it('shows the empty state when nothing matches', async () => {
		mockLoad();
		render(Page);

		await page.getByRole('searchbox', { name: 'Buscar por nome ou professor' }).fill('zzz');

		await expect.element(page.getByText('Nenhuma turma encontrada')).toBeVisible();
	});

	it('shows an error state with retry when the API fails', async () => {
		vi.mocked(classesApi.listClasses).mockRejectedValue(new Error('boom'));
		render(Page);

		await expect.element(page.getByText(/Não foi possível carregar as turmas/)).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
	});
});
