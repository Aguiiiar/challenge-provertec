import { describe, expect, it } from 'vitest';
import { formatPhoneBR } from './format';

describe('formatPhoneBR', () => {
	it('formats an 11-digit mobile number', () => {
		expect(formatPhoneBR('11987654321')).toBe('(11) 98765-4321');
	});

	it('formats a 10-digit landline number', () => {
		expect(formatPhoneBR('1198765432')).toBe('(11) 9876-5432');
	});

	it('formats numbers that already contain formatting characters', () => {
		expect(formatPhoneBR('(11) 9876-5432')).toBe('(11) 9876-5432');
	});

	it('returns malformed input unchanged', () => {
		expect(formatPhoneBR('123')).toBe('123');
		expect(formatPhoneBR('')).toBe('');
	});
});
