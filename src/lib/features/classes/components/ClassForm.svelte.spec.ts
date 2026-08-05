import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import * as classesApi from '../api/classes.api';
import type { ClassRecord } from '../types/classes.types';
import ClassForm from './ClassForm.svelte';

vi.mock('../api/classes.api', () => ({
	createClass: vi.fn(),
	updateClass: vi.fn()
}));

const schools = [
	{
		id: 1,
		name: 'EMEF Monteiro Lobato',
		address: '',
		city: '',
		phone: '',
		email: '',
		director: ''
	},
	{
		id: 2,
		name: 'EMEF Paulo Freire',
		address: '',
		city: '',
		phone: '',
		email: '',
		director: ''
	}
];

const klass: ClassRecord = {
	id: 1,
	schoolId: 1,
	name: '1º Ano A',
	grade: '1º Ano',
	shift: 'morning',
	teacher: 'Fernanda',
	capacity: 30
};

function noop() {}

describe('ClassForm', () => {
	it('shows inline errors when required fields are empty on submit', async () => {
		render(ClassForm, { open: true, klass: null, schools, onClose: noop, onSaved: noop });

		await page.getByRole('button', { name: 'Salvar' }).click();

		await expect.element(page.getByText('Nome é obrigatório.')).toBeVisible();
		await expect.element(page.getByText('Selecione a escola.')).toBeVisible();
		expect(vi.mocked(classesApi.createClass)).not.toHaveBeenCalled();
	});

	it('creates a class with valid data and calls onSaved', async () => {
		vi.mocked(classesApi.createClass).mockResolvedValue({ ...klass, id: 9, name: '2º Ano B' });
		const onSaved = vi.fn();
		render(ClassForm, { open: true, klass: null, schools, onClose: noop, onSaved });

		await page.getByRole('textbox', { name: 'Nome' }).fill('2º Ano B');
		await page.getByRole('combobox', { name: 'Escola' }).selectOptions('2');
		await page.getByRole('spinbutton', { name: 'Capacidade' }).fill('28');
		await page.getByRole('button', { name: 'Salvar' }).click();

		await vi.waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
		expect(vi.mocked(classesApi.createClass)).toHaveBeenCalledWith({
			schoolId: 2,
			name: '2º Ano B',
			grade: '',
			shift: 'morning',
			teacher: '',
			capacity: 28
		});
	});

	it('pre-fills fields and updates when editing', async () => {
		vi.mocked(classesApi.updateClass).mockResolvedValue({ ...klass, capacity: 35 });
		const onSaved = vi.fn();
		render(ClassForm, { open: true, klass, schools, onClose: noop, onSaved });

		const capacidadeInput = page.getByRole('spinbutton', { name: 'Capacidade' });
		await expect.element(capacidadeInput).toHaveValue(30);
		await capacidadeInput.fill('35');
		await page.getByRole('button', { name: 'Salvar' }).click();

		await vi.waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
		expect(vi.mocked(classesApi.updateClass)).toHaveBeenCalledWith(1, {
			schoolId: 1,
			name: '1º Ano A',
			grade: '1º Ano',
			shift: 'morning',
			teacher: 'Fernanda',
			capacity: 35
		});
	});
});
