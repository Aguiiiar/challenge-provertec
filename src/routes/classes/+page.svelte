<script lang="ts">
	import { onMount } from 'svelte';
	import { Pencil, Plus, Search, Trash2, Users } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { listSchools } from '../../lib/features/schools/api/schools.api';
	import type { School } from '../../lib/features/schools/types/schools.types';
	import { deleteClass, listClasses } from '../../lib/features/classes/api/classes.api';
	import ClassForm from '../../lib/features/classes/components/ClassForm.svelte';
	import { shiftLabel } from '../../lib/features/classes/types/classes.types';
	import type { ClassRecord } from '../../lib/features/classes/types/classes.types';

	let classes = $state<ClassRecord[]>([]);
	let schools = $state<School[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let search = $state('');
	let schoolFilter = $state('all');
	let formState = $state<'create' | { mode: 'edit'; klass: ClassRecord } | null>(null);
	let deleteTarget = $state<ClassRecord | null>(null);

	const schoolName = (schoolId: number) => schools.find((s) => s.id === schoolId)?.name ?? '—';

	const filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return classes.filter(
			(c) =>
				(schoolFilter === 'all' || c.schoolId === Number(schoolFilter)) &&
				(q === '' || c.name.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q))
		);
	});

	async function load() {
		loading = true;
		error = null;
		try {
			const [classesData, schoolsData] = await Promise.all([listClasses(), listSchools()]);
			classes = classesData;
			schools = schoolsData;
		} catch {
			error = 'Não foi possível carregar as turmas.';
		} finally {
			loading = false;
		}
	}

	function handleSaved(klass: ClassRecord) {
		classes = classes.some((c) => c.id === klass.id)
			? classes.map((c) => (c.id === klass.id ? klass : c))
			: [...classes, klass];
	}

	async function confirmDelete(klass: ClassRecord) {
		await deleteClass(klass.id);
		classes = classes.filter((c) => c.id !== klass.id);
		deleteTarget = null;
	}

	onMount(load);
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
		<div class="relative flex-1">
			<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input.Root
				class="pl-9"
				type="search"
				placeholder="Buscar por nome ou professor"
				bind:value={search}
				aria-label="Buscar por nome ou professor"
			/>
		</div>
		<label class="flex items-center gap-2 text-sm">
			<span class="sr-only">Escola</span>
			<select
				class="h-7 min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30"
				bind:value={schoolFilter}
				aria-label="Escola"
			>
				<option value="all">Todas as escolas</option>
				{#each schools as school (school.id)}
					<option value={school.id}>{school.name}</option>
				{/each}
			</select>
		</label>
		<Button.Root onclick={() => (formState = 'create')}>
			<Plus class="size-4" />
			Adicionar turma
		</Button.Root>
	</div>

	{#if loading}
		<div class="flex flex-col gap-2" aria-busy="true">
			{#each [0, 1, 2] as i (i)}
				<Skeleton.Root class="h-10 w-full" />
			{/each}
		</div>
	{:else if error}
		<div class="flex flex-col items-center gap-2 rounded-lg border p-8 text-center">
			<p role="alert" class="text-sm text-destructive">{error}</p>
			<Button.Root variant="outline" onclick={load}>Tentar novamente</Button.Root>
		</div>
	{:else if filtered.length === 0}
		<div class="flex flex-col items-center gap-2 rounded-lg border p-8 text-center">
			<Users class="size-8 text-muted-foreground" />
			<p class="text-sm text-muted-foreground">Nenhuma turma encontrada</p>
			<Button.Root variant="outline" onclick={() => (formState = 'create')}
				>Adicionar turma</Button.Root
			>
		</div>
	{:else}
		<div class="rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Turma</Table.Head>
						<Table.Head>Escola</Table.Head>
						<Table.Head>Ano/Série</Table.Head>
						<Table.Head>Turno</Table.Head>
						<Table.Head>Professor(a)</Table.Head>
						<Table.Head class="text-center">Capacidade</Table.Head>
						<Table.Head class="text-right">Ações</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as klass (klass.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{klass.name}</Table.Cell>
							<Table.Cell>{schoolName(klass.schoolId)}</Table.Cell>
							<Table.Cell>{klass.grade}</Table.Cell>
							<Table.Cell>{shiftLabel(klass.shift)}</Table.Cell>
							<Table.Cell>{klass.teacher}</Table.Cell>
							<Table.Cell class="text-center">{klass.capacity}</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-1">
									<Button.Root
										variant="ghost"
										size="icon"
										aria-label={`Editar ${klass.name}`}
										onclick={() => (formState = { mode: 'edit', klass })}
									>
										<Pencil class="size-4" />
									</Button.Root>
									<Button.Root
										variant="ghost"
										size="icon"
										aria-label={`Excluir ${klass.name}`}
										class="text-destructive hover:text-destructive"
										onclick={() => (deleteTarget = klass)}
									>
										<Trash2 class="size-4" />
									</Button.Root>
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
	{#if formState !== null}
		<ClassForm
			open={true}
			klass={formState === 'create' ? null : formState.klass}
			{schools}
			onClose={() => (formState = null)}
			onSaved={(s) => {
				handleSaved(s);
				formState = null;
			}}
		/>
	{/if}

	{#if deleteTarget !== null}
		<AlertDialog.Root open={true} onOpenChange={(o) => !o && (deleteTarget = null)}>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Excluir turma</AlertDialog.Title>
					<AlertDialog.Description>
						Tem certeza que deseja excluir a turma "{deleteTarget.name}"? Esta ação não pode ser
						desfeita.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>
					<AlertDialog.Action onclick={() => confirmDelete(deleteTarget!)}
						>Excluir</AlertDialog.Action
					>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	{/if}
</div>
