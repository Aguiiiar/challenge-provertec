import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import * as schoolsApi from './schools.api';
import SchoolForm from './SchoolForm.svelte';

vi.mock('./schools.api', () => ({
	createSchool: vi.fn(),
	updateSchool: vi.fn()
}));

const school = {
	id: 1,
	name: 'EMEF Monteiro Lobato',
	address: 'Rua A, 10',
	city: 'São Paulo',
	phone: '11987654321',
	email: 'a@b.gov.br',
	director: 'Ana'
};

function noop() {}

describe('SchoolForm', () => {
	it('shows inline errors when required fields are empty on submit', async () => {
		render(SchoolForm, { open: true, school: null, onClose: noop, onSaved: noop });

		await page.getByRole('button', { name: 'Salvar' }).click();

		await expect.element(page.getByText('Nome é obrigatório.')).toBeVisible();
		await expect.element(page.getByText('E-mail é obrigatório.')).toBeVisible();
		await expect.element(page.getByText('Telefone é obrigatório.')).toBeVisible();
		expect(vi.mocked(schoolsApi.createSchool)).not.toHaveBeenCalled();
	});

	it('creates a school with valid data and calls onSaved', async () => {
		vi.mocked(schoolsApi.createSchool).mockResolvedValue({ ...school, id: 2, name: 'EMEF Nova' });
		const onSaved = vi.fn();
		render(SchoolForm, { open: true, school: null, onClose: noop, onSaved });

		await page.getByRole('textbox', { name: 'Nome' }).fill('EMEF Nova');
		await page.getByRole('textbox', { name: 'Telefone' }).fill('11999998888');
		await page.getByRole('textbox', { name: 'E-mail' }).fill('nova@teste.gov.br');
		await page.getByRole('button', { name: 'Salvar' }).click();

		await vi.waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
		expect(vi.mocked(schoolsApi.createSchool)).toHaveBeenCalledWith({
			name: 'EMEF Nova',
			address: '',
			city: '',
			phone: '11999998888',
			email: 'nova@teste.gov.br',
			director: ''
		});
	});

	it('pre-fills fields and updates when editing', async () => {
		vi.mocked(schoolsApi.updateSchool).mockResolvedValue({ ...school, name: 'EMEF Editada' });
		const onSaved = vi.fn();
		render(SchoolForm, { open: true, school, onClose: noop, onSaved });

		const nomeInput = page.getByRole('textbox', { name: 'Nome' });
		await expect.element(nomeInput).toHaveValue('EMEF Monteiro Lobato');
		await nomeInput.fill('EMEF Editada');
		await page.getByRole('button', { name: 'Salvar' }).click();

		await vi.waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
		expect(vi.mocked(schoolsApi.updateSchool)).toHaveBeenCalledWith(1, {
			name: 'EMEF Editada',
			address: 'Rua A, 10',
			city: 'São Paulo',
			phone: '11987654321',
			email: 'a@b.gov.br',
			director: 'Ana'
		});
	});
});
