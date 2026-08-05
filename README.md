# Gestão Escolar — Escolas e Turmas

Aplicação web em SvelteKit para gerenciamento de escolas públicas municipais e suas turmas, consumindo uma API REST simulada com Json Server. Desenvolvida como desafio técnico.

## Requisitos

- Node.js 20+ (testado com Node 24)
- Yarn 1.x

## Stack

SvelteKit 2 · Svelte 5 (runes) · TypeScript · zod · Tailwind CSS 4 · shadcn-svelte · Json Server · Vitest · Playwright · ESLint · Prettier

## Instalação

```sh
yarn install
```

## Execução

### 1. Subir a API simulada (Json Server)

```sh
yarn api
# Json Server em http://localhost:3001
```

Endpoints: `GET/POST/PUT/DELETE /schools` e `GET/POST/PUT/DELETE /classes`. Os dados ficam em `db.json` (semear: `db.seed.json`).

### 2. Subir a aplicação

```sh
yarn dev
# http://localhost:5173
```

A aplicação aponta para `http://localhost:3001` por padrão. Para usar outra URL: `VITE_API_BASE_URL=http://localhost:3001 yarn dev`.

## Testes

### Unitários e de componentes (Vitest)

```sh
yarn test:unit -- --run
```

### End-to-end (Playwright)

```sh
yarn test:e2e
# Instala o Chromium, sobe a API e a aplicação (build + preview), e executa os cenários
```

Os testes E2E reiniciam `db.json` a partir de `db.seed.json` a cada execução e encerram servidores órfãos da porta 3001 antes de subir a API — tudo configurado em `playwright.config.ts`.

### Verificação de qualidade

```sh
yarn run check   # svelte-check (tipagem)
yarn lint    # Prettier + ESLint
yarn format  # formata o código
```

## Estrutura

- `src/routes/schools/` — feature de escolas (tela, formulário, API client, tipos e testes)
- `src/routes/classes/` — feature de turmas
- `src/lib/` — código compartilhado (cliente HTTP e componentes de UI)
- `db.json` / `db.seed.json` — dados da API simulada
- `e2e/` — testes Playwright e setup global

## Decisões de produto

- Excluir uma escola com turmas é bloqueado: é preciso excluir as turmas antes. Isso evita dados órfãos.
- Formulários validados com zod (mensagens de erro em pt-BR) e telefone formatado automaticamente na listagem.
- Busca de escolas por nome ou cidade; filtro por cidade. Turmas filtram por escola, nome ou professor(a).
