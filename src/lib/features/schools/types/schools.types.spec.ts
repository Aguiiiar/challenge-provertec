import { describe, expect, it } from 'vitest';
import { validateSchool } from './schools.types';

const valid: Record<string, string> = {
	name: 'EMEF Teste',
	address: 'Rua A, 1',
	city: 'São Paulo',
	phone: '11987654321',
	email: 'escola@teste.gov.br',
	director: 'Ana'
};

describe('validateSchool', () => {
	it('accepts a fully valid school', () => {
		expect(validateSchool(valid as never)).toEqual({});
	});

	it('requires name', () => {
		const errors = validateSchool({ ...valid, name: '   ' } as never);
		expect(errors.name).toBe('Nome é obrigatório.');
	});

	it('requires a valid email', () => {
		expect(validateSchool({ ...valid, email: '' } as never).email).toBe('E-mail é obrigatório.');
		expect(validateSchool({ ...valid, email: 'invalido' } as never).email).toBe(
			'Informe um e-mail válido.'
		);
	});

	it('requires a phone with at least 8 digits', () => {
		expect(validateSchool({ ...valid, phone: '' } as never).phone).toBe('Telefone é obrigatório.');
		expect(validateSchool({ ...valid, phone: '123' } as never).phone).toBe(
			'Informe um telefone válido (mín. 8 dígitos).'
		);
	});

	it('accepts phone with formatting characters', () => {
		expect(validateSchool({ ...valid, phone: '(11) 98765-4321' } as never)).toEqual({});
	});
});
