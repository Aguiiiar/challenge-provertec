<script lang="ts">
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { createSchool, updateSchool } from '../api/schools.api';
	import { validateSchool } from '../types/schools.types';
	import type { School, SchoolErrors, SchoolInput } from '../types/schools.types';

	interface Props {
		open: boolean;
		school: School | null;
		onClose: () => void;
		onSaved: (school: School) => void;
	}

	let { open, school, onClose, onSaved }: Props = $props();

	const empty: SchoolInput = {
		name: '',
		address: '',
		city: '',
		phone: '',
		email: '',
		director: ''
	};

	let draft = $state<SchoolInput>({ ...empty });
	let errors = $state<SchoolErrors>({});
	let submitting = $state(false);
	let serverError = $state<string | null>(null);

	$effect(() => {
		if (open) {
			draft = school
				? {
						name: school.name,
						address: school.address,
						city: school.city,
						phone: school.phone,
						email: school.email,
						director: school.director
					}
				: { ...empty };
			errors = {};
			serverError = null;
		}
	});

	async function submit() {
		const validation = validateSchool(draft);
		errors = validation;
		if (Object.keys(validation).length > 0) return;

		submitting = true;
		serverError = null;
		try {
			const saved = school ? await updateSchool(school.id, draft) : await createSchool(draft);
			onSaved(saved);
		} catch (err) {
			serverError = err instanceof Error ? err.message : 'Não foi possível salvar a escola.';
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={(o) => !o && onClose()}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{school ? 'Editar escola' : 'Adicionar escola'}</Dialog.Title>
			<Dialog.Description>Preencha os dados da escola.</Dialog.Description>
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
				<label for="school-name" class="text-sm font-medium">Nome</label>
				<Input.Root
					id="school-name"
					type="text"
					bind:value={draft.name}
					aria-invalid={!!errors.name}
				/>
				{#if errors.name}<p role="alert" class="text-xs text-destructive">{errors.name}</p>{/if}
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="flex flex-col gap-1.5">
					<label for="school-address" class="text-sm font-medium">Endereço</label>
					<Input.Root id="school-address" type="text" bind:value={draft.address} />
				</div>
				<div class="flex flex-col gap-1.5">
					<label for="school-city" class="text-sm font-medium">Cidade</label>
					<Input.Root id="school-city" type="text" bind:value={draft.city} />
				</div>
				<div class="flex flex-col gap-1.5">
					<label for="school-email" class="text-sm font-medium">E-mail</label>
					<Input.Root
						id="school-email"
						type="email"
						bind:value={draft.email}
						aria-invalid={!!errors.email}
					/>
					{#if errors.email}<p role="alert" class="text-xs text-destructive">{errors.email}</p>{/if}
				</div>
				<div class="flex flex-col gap-1.5">
					<label for="school-phone" class="text-sm font-medium">Telefone</label>
					<Input.Root
						id="school-phone"
						type="tel"
						bind:value={draft.phone}
						aria-invalid={!!errors.phone}
					/>
					{#if errors.phone}<p role="alert" class="text-xs text-destructive">
							{errors.phone}
						</p>{/if}
				</div>
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="school-director" class="text-sm font-medium">Diretor(a)</label>
				<Input.Root id="school-director" type="text" bind:value={draft.director} />
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
