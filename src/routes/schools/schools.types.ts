import { z } from 'zod';

export const schoolSchema = z.object({
	name: z.string().trim().min(1, 'Nome é obrigatório.'),
	email: z.string().trim().min(1, 'E-mail é obrigatório.').email('Informe um e-mail válido.'),
	phone: z
		.string()
		.trim()
		.min(1, 'Telefone é obrigatório.')
		.refine(
			(value) => value.replace(/\D/g, '').length >= 8,
			'Informe um telefone válido (mín. 8 dígitos).'
		),
	address: z.string(),
	city: z.string(),
	director: z.string()
});

export type SchoolInput = z.infer<typeof schoolSchema>;

export interface School extends SchoolInput {
	id: number;
}

export type SchoolErrors = Partial<Record<keyof SchoolInput, string>>;

export function validateSchool(input: SchoolInput): SchoolErrors {
	const result = schoolSchema.safeParse(input);
	if (result.success) return {};

	const errors: SchoolErrors = {};
	for (const issue of result.error.issues) {
		const key = issue.path[0] as keyof SchoolInput;
		if (errors[key] === undefined) errors[key] = issue.message;
	}
	return errors;
}
