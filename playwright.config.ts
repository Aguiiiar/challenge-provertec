import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: {
		baseURL: 'http://localhost:4173',
		launchOptions: {
			slowMo: 400
		}
	},
	workers: 1,
	webServer: [
		{
			command:
				'lsof -ti :3001 | xargs -r kill 2>/dev/null || true; cp db.seed.json db.json && npx json-server --watch db.json --port 3001',
			port: 3001
		},
		{
			command: 'VITE_API_BASE_URL=http://localhost:3001 npm run build && npm run preview',
			port: 4173,
			timeout: 120_000
		}
	],
	testMatch: '**/*.e2e.{ts,js}'
});
