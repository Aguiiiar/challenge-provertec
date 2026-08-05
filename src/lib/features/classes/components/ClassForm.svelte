<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { School } from '../../schools/types/schools.types';
	import { createClass, updateClass } from '../api/classes.api';
	import { SHIFTS, shiftLabel, validateClass } from '../types/classes.types';
	import type { ClassErrors, ClassInput, ClassRecord } from '../types/classes.types';

	interface Props {
		open: boolean;
		klass: ClassRecord | null;
		schools: School[];
		onClose: () => void;
		onSaved: (klass: ClassRecord) => void;
	}

	let { open, klass, schools, onClose, onSaved }: Props = $props();

	const empty: ClassInput = {
		schoolId: 0,
		name: '',
		grade: '',
		shift: 'morning',
		teacher: '',
		capacity: 0
	};

	let draft = $state<ClassInput>({ ...empty });
	let errors = $state<ClassErrors>({});
	let submitting = $state(false);
	let serverError = $state<string | null>(null);

	$effect(() => {
		if (open) {
			draft = klass
				? {
						schoolId: klass.schoolId,
						name: klass.name,
						grade: klass.grade,
						shift: klass.shift,
						teacher: klass.teacher,
						capacity: klass.capacity
					}
				: { ...empty };
			errors = {};
			serverError = null;
		}
	});

	async function submit() {
		const validation = validateClass(draft);
		errors = validation;
		if (Object.keys(validation).length > 0) return;

		submitting = true;
		serverError = null;
		try {
			const saved = klass ? await updateClass(klass.id, draft) : await createClass(draft);
			onSaved(saved);
		} catch (err) {
			serverError = err instanceof Error ? err.message : 'Não foi possível salvar a turma.';
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={(o) => !o && onClose()}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{klass ? 'Editar turma' : 'Adicionar turma'}</Dialog.Title>
			<Dialog.Description>Preencha os dados da turma.</Dialog.Description>
		</Dialog.Header>

		<form
			class="flex flex-col gap-4"
			novalidate
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<div class="flex flex-col gap-1.5">
				<label for="class-name" class="text-sm font-medium">Nome</label>
				<Input.Root
					id="class-name"
					type="text"
					bind:value={draft.name}
					aria-invalid={!!errors.name}
				/>
				{#if errors.name}<p role="alert" class="text-xs text-destructive">{errors.name}</p>{/if}
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="flex flex-col gap-1.5">
					<label for="class-escola" class="text-sm font-medium">Escola</label>
					<select
						id="class-escola"
						class="h-7 min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30"
						bind:value={draft.schoolId}
						aria-invalid={!!errors.schoolId}
					>
						<option value="0">Selecione a escola</option>
						{#each schools as school (school.id)}
							<option value={school.id}>{school.name}</option>
						{/each}
					</select>
					{#if errors.schoolId}<p role="alert" class="text-xs text-destructive">
							{errors.schoolId}
						</p>{/if}
				</div>
				<div class="flex flex-col gap-1.5">
					<label for="class-grade" class="text-sm font-medium">Ano/Série</label>
					<Input.Root id="class-grade" type="text" bind:value={draft.grade} />
				</div>
				<div class="flex flex-col gap-1.5">
					<label for="class-teacher" class="text-sm font-medium">Professor(a)</label>
					<Input.Root id="class-teacher" type="text" bind:value={draft.teacher} />
				</div>
				<div class="flex flex-col gap-1.5">
					<label for="class-shift" class="text-sm font-medium">Turno</label>
					<select
						id="class-shift"
						class="h-7 min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30"
						bind:value={draft.shift}
					>
						{#each SHIFTS as shift (shift)}
							<option value={shift}>{shiftLabel(shift)}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="class-capacity" class="text-sm font-medium">Capacidade</label>
				<Input.Root
					id="class-capacity"
					type="number"
					min="1"
					bind:value={draft.capacity}
					aria-invalid={!!errors.capacity}
				/>
				{#if errors.capacity}<p role="alert" class="text-xs text-destructive">
						{errors.capacity}
					</p>{/if}
			</div>

			{#if serverError}<p role="alert" class="text-sm text-destructive">{serverError}</p>{/if}

			<Dialog.Footer>
				<Button.Root type="button" variant="outline" onclick={onClose} disabled={submitting}
					>Cancelar</Button.Root
				>
				<Button.Root type="submit" disabled={submitting}>
					{submitting ? 'Salvando…' : 'Salvar'}
				</Button.Root>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
