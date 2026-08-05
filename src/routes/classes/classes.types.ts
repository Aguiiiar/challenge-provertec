import { z } from 'zod';

export const SHIFTS = ['morning', 'afternoon', 'night'] as const;
export type Shift = (typeof SHIFTS)[number];

const SHIFT_LABELS: Record<Shift, string> = {
	morning: 'Matutino',
	afternoon: 'Vespertino',
	night: 'Noturno'
};

export function shiftLabel(shift: Shift): string {
	return SHIFT_LABELS[shift];
}

export const classSchema = z.object({
	schoolId: z.number().min(1, 'Selecione a escola.'),
	name: z.string().trim().min(1, 'Nome é obrigatório.'),
	grade: z.string(),
	shift: z.enum(SHIFTS, { error: 'Selecione um turno válido.' }),
	teacher: z.string(),
	capacity: z
		.number()
		.int('Informe a capacidade (mínimo 1).')
		.min(1, 'Informe a capacidade (mínimo 1).')
});

export type ClassInput = z.infer<typeof classSchema>;

export interface ClassRecord extends ClassInput {
	id: number;
}

export type ClassErrors = Partial<Record<keyof ClassInput, string>>;

export function validateClass(input: ClassInput): ClassErrors {
	const result = classSchema.safeParse(input);
	if (result.success) return {};

	const errors: ClassErrors = {};
	for (const issue of result.error.issues) {
		const key = issue.path[0] as keyof ClassInput;
		if (errors[key] === undefined) errors[key] = issue.message;
	}
	return errors;
}
