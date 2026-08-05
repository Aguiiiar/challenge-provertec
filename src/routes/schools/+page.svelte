<script lang="ts">
	import { onMount } from 'svelte';
	import { Building2, Pencil, Plus, Search, Trash2 } from '@lucide/svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import * as Input from '$lib/components/ui/input/index.js';
	import * as Skeleton from '$lib/components/ui/skeleton/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { listClasses } from '../../lib/features/classes/api/classes.api';
	import type { ClassRecord } from '../../lib/features/classes/types/classes.types';
	import { deleteSchool, listSchools } from '../../lib/features/schools/api/schools.api';
	import type { School } from '../../lib/features/schools/types/schools.types';
	import { formatPhoneBR } from '$lib/format';
	import SchoolForm from '../../lib/features/schools/components/SchoolForm.svelte';

	let schools = $state<School[]>([]);
	let classes = $state<ClassRecord[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let search = $state('');
	let city = $state('all');
	let formState = $state<'create' | { mode: 'edit'; school: School } | null>(null);
	let deleteTarget = $state<School | null>(null);

	const cities = $derived([...new Set(schools.map((s) => s.city))].sort());

	const filtered = $derived.by(() => {
		const q = search.trim().toLowerCase();
		return schools.filter(
			(s) =>
				(city === 'all' || s.city === city) &&
				(q === '' || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q))
		);
	});

	const classCount = (schoolId: number) => classes.filter((c) => c.schoolId === schoolId).length;

	async function load() {
		loading = true;
		error = null;
		try {
			const [schoolsData, classesData] = await Promise.all([listSchools(), listClasses()]);
			schools = schoolsData;
			classes = classesData;
		} catch {
			error = 'Não foi possível carregar as escolas.';
		} finally {
			loading = false;
		}
	}

	function handleSaved(school: School) {
		schools = schools.some((s) => s.id === school.id)
			? schools.map((s) => (s.id === school.id ? school : s))
			: [...schools, school];
	}

	async function confirmDelete(school: School | null) {
		if (!school) return;
		await deleteSchool(school.id);
		schools = schools.filter((s) => s.id !== school.id);
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
				id="search"
				type="search"
				placeholder="Buscar por nome ou cidade"
				bind:value={search}
				aria-label="Buscar por nome ou cidade"
			/>
		</div>
		<label class="flex items-center gap-2 text-sm">
			<span class="sr-only">Cidade</span>
			<select
				class="h-7 min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:bg-input/30"
				bind:value={city}
				aria-label="Cidade"
			>
				<option value="all">Todas as cidades</option>
				{#each cities as c (c)}
					<option value={c}>{c}</option>
				{/each}
			</select>
		</label>
		<Button.Root onclick={() => (formState = 'create')}>
			<Plus class="size-4" />
			Adicionar escola
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
			<Building2 class="size-8 text-muted-foreground" />
			<p class="text-sm text-muted-foreground">Nenhuma escola encontrada</p>
			<Button.Root variant="outline" onclick={() => (formState = 'create')}
				>Adicionar escola</Button.Root
			>
		</div>
	{:else}
		<div class="rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Nome</Table.Head>
						<Table.Head>Cidade</Table.Head>
						<Table.Head>Endereço</Table.Head>
						<Table.Head>Telefone</Table.Head>
						<Table.Head>Diretor(a)</Table.Head>
						<Table.Head class="text-center">Turmas</Table.Head>
						<Table.Head class="text-right">Ações</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filtered as school (school.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{school.name}</Table.Cell>
							<Table.Cell>{school.city}</Table.Cell>
							<Table.Cell>{school.address}</Table.Cell>
							<Table.Cell>{formatPhoneBR(school.phone)}</Table.Cell>
							<Table.Cell>{school.director}</Table.Cell>
							<Table.Cell class="text-center">{classCount(school.id)}</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex justify-end gap-1">
									<Button.Root
										variant="ghost"
										size="icon"
										aria-label={`Editar ${school.name}`}
										onclick={() => (formState = { mode: 'edit', school })}
									>
										<Pencil class="size-4" />
									</Button.Root>
									<Button.Root
										variant="ghost"
										size="icon"
										aria-label={`Excluir ${school.name}`}
										class="text-destructive hover:text-destructive"
										onclick={() => (deleteTarget = school)}
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
		<SchoolForm
			open={true}
			school={formState === 'create' ? null : formState.school}
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
					<AlertDialog.Title>Excluir escola</AlertDialog.Title>
					<AlertDialog.Description>
						{#if classCount(deleteTarget.id) > 0}
							<span role="alert">
								Esta escola possui {classCount(deleteTarget.id)} turma(s). Exclua as turmas antes de remover
								a escola.
							</span>
						{:else}
							Tem certeza que deseja excluir "{deleteTarget.name}"? Esta ação não pode ser desfeita.
						{/if}
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					{#if classCount(deleteTarget.id) > 0}
						<AlertDialog.Cancel>Fechar</AlertDialog.Cancel>
					{:else}
						<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>
						<AlertDialog.Action onclick={() => confirmDelete(deleteTarget)}
							>Excluir</AlertDialog.Action
						>
					{/if}
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	{/if}
</div>
