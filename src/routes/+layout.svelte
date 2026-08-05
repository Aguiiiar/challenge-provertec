<script lang="ts">
	import './layout.css';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />

	<main class="flex-1">
		<header
			class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
		>
			<div class="flex h-14 items-center gap-4 px-4 md:px-6">
				<div class="flex-1">
					<h1 class="text-lg font-semibold">
						{#if page.url.pathname === '/'}
							Dashboard
						{:else if page.url.pathname.startsWith('/schools')}
							Gestão de Escolas
						{:else}
							Gestão Escolar
						{/if}
					</h1>
				</div>
			</div>
		</header>

		<!-- Conteúdo da página -->
		<div class="p-4 md:p-6">
			{@render children?.()}
		</div>
	</main>
</Sidebar.Provider>
