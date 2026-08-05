import { describe, expect, it } from 'vitest';
import { shiftLabel, validateClass } from './classes.types';

const valid = {
	schoolId: 1,
	name: '1º Ano A',
	grade: '1º Ano',
	shift: 'morning',
	teacher: 'Fernanda',
	capacity: 30
} as const;

describe('validateClass', () => {
	it('accepts a fully valid class', () => {
		expect(validateClass({ ...valid })).toEqual({});
	});

	it('requires name', () => {
		expect(validateClass({ ...valid, name: ' ' }).name).toBe('Nome é obrigatório.');
	});

	it('requires schoolId', () => {
		expect(validateClass({ ...valid, schoolId: 0 }).schoolId).toBe('Selecione a escola.');
	});

	it('rejects an invalid shift', () => {
		expect(validateClass({ ...valid, shift: 'madrugada' as never }).shift).toBe(
			'Selecione um turno válido.'
		);
	});

	it('requires capacity as an integer >= 1', () => {
		expect(validateClass({ ...valid, capacity: 0 }).capacity).toBe(
			'Informe a capacidade (mínimo 1).'
		);
		expect(validateClass({ ...valid, capacity: 2.5 }).capacity).toBe(
			'Informe a capacidade (mínimo 1).'
		);
	});
});

describe('shiftLabel', () => {
	it('maps shift values to pt-BR labels', () => {
		expect(shiftLabel('morning')).toBe('Matutino');
		expect(shiftLabel('afternoon')).toBe('Vespertino');
		expect(shiftLabel('night')).toBe('Noturno');
	});
});
