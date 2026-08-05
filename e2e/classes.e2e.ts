import { expect, test } from '@playwright/test';

test('lists seeded classes with school names', async ({ page }) => {
	await page.goto('/classes');

	await expect(page.getByRole('row', { name: /1º Ano A/ })).toContainText('EMEF Monteiro Lobato');
	await expect(page.getByRole('row', { name: /5º Ano A/ })).toContainText('Noturno');
});

test('creates a class', async ({ page }) => {
	await page.goto('/classes');
	await page.getByRole('button', { name: 'Adicionar turma' }).click();

	await page.getByLabel('Nome', { exact: true }).fill('Turma E2E');
	await page
		.getByRole('dialog')
		.getByLabel('Escola', { exact: true })
		.selectOption({ label: 'EMEF Monteiro Lobato' });
	await page.getByLabel('Ano/Série', { exact: true }).fill('2º Ano');
	await page.getByLabel('Turno', { exact: true }).selectOption({ label: 'Vespertino' });
	await page.getByLabel('Professor(a)', { exact: true }).fill('Professor E2E');
	await page.getByLabel('Capacidade', { exact: true }).fill('25');
	await page.getByRole('button', { name: 'Salvar' }).click();

	await expect(page.getByRole('row', { name: /Turma E2E/ })).toBeVisible();

	await page.getByRole('button', { name: 'Excluir Turma E2E' }).click();
	await page.getByRole('button', { name: 'Excluir', exact: true }).click();
	await expect(page.getByRole('row', { name: /Turma E2E/ })).toBeHidden();
});

test('edits a class', async ({ page }) => {
	await page.goto('/classes');
	await page.getByRole('button', { name: 'Adicionar turma' }).click();
	await page.getByLabel('Nome', { exact: true }).fill('Turma Editar E2E');
	await page
		.getByRole('dialog')
		.getByLabel('Escola', { exact: true })
		.selectOption({ label: 'EMEF Monteiro Lobato' });
	await page.getByLabel('Capacidade', { exact: true }).fill('20');
	await page.getByRole('button', { name: 'Salvar' }).click();
	await expect(page.getByRole('row', { name: /Turma Editar E2E/ })).toBeVisible();

	await page.getByRole('button', { name: 'Editar Turma Editar E2E' }).click();
	await page.getByLabel('Capacidade', { exact: true }).fill('22');
	await page.getByRole('button', { name: 'Salvar' }).click();

	await expect(page.getByRole('row', { name: /Turma Editar E2E/ })).toContainText('22');

	await page.getByRole('button', { name: 'Excluir Turma Editar E2E' }).click();
	await page.getByRole('button', { name: 'Excluir', exact: true }).click();
	await expect(page.getByRole('row', { name: /Turma Editar E2E/ })).toBeHidden();
});

test('deletes a class after confirming', async ({ page }) => {
	await page.goto('/classes');
	await page.getByRole('button', { name: 'Adicionar turma' }).click();
	await page.getByLabel('Nome', { exact: true }).fill('Turma Excluir E2E');
	await page
		.getByRole('dialog')
		.getByLabel('Escola', { exact: true })
		.selectOption({ label: 'EMEF Monteiro Lobato' });
	await page.getByLabel('Capacidade', { exact: true }).fill('20');
	await page.getByRole('button', { name: 'Salvar' }).click();
	await expect(page.getByRole('row', { name: /Turma Excluir E2E/ })).toBeVisible();

	await page.getByRole('button', { name: 'Excluir Turma Excluir E2E' }).click();
	await page.getByRole('button', { name: 'Excluir', exact: true }).click();

	await expect(page.getByRole('row', { name: /Turma Excluir E2E/ })).toBeHidden();
});

test('filters classes by school', async ({ page }) => {
	await page.goto('/classes');

	await page.getByLabel('Escola', { exact: true }).selectOption({ label: 'EMEF Anísio Teixeira' });
	await expect(page.getByRole('row', { name: /1º Ano B/ })).toBeVisible();
	await expect(page.getByRole('row', { name: /1º Ano A/ })).toBeHidden();
});
