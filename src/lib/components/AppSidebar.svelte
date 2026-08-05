<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Building, School, Users } from '@lucide/svelte';
	import type { Component } from 'svelte';

	interface MenuItem {
		label: string;
		path: string;
		icon: Component;
		activeCheck: (currentPath: string) => boolean;
	}

	const mainMenu: MenuItem[] = [
		{
			label: 'Escolas',
			path: '/schools',
			icon: School,
			activeCheck: (path) => path.startsWith('/schools')
		},
		{
			label: 'Salas',
			path: '/classes',
			icon: Users,
			activeCheck: (path) => path.startsWith('/classes')
		}
	];

	function navigate(path: string) {
		goto(path);
	}
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<button
			onclick={() => navigate('/')}
			class="flex w-full flex-col gap-1 border-b border-sidebar-border px-4 py-5 text-left transition-colors hover:bg-sidebar-accent/50"
		>
			<h2 class="flex items-center gap-2 text-lg font-bold text-sidebar-primary">
				<Building class="h-6 w-6" />
				Gestão Escolar
			</h2>
			<p class="pl-8 text-xs text-sidebar-foreground/60">Prefeitura Municipal</p>
		</button>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each mainMenu as item (item.path)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							isActive={item.activeCheck(page.url.pathname)}
							onclick={() => navigate(item.path)}
							class="gap-3"
						>
							<item.icon class="h-5 w-5" />
							{item.label}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<div class="flex items-center gap-3 border-t border-sidebar-border px-3 py-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
				<span class="text-sm font-bold text-sidebar-foreground">A</span>
			</div>
			<div class="flex flex-col">
				<span class="text-sm font-medium text-sidebar-foreground">Administrador</span>
				<span class="text-xs text-sidebar-foreground/50">Gestor Municipal</span>
			</div>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>
