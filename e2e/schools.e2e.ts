import { expect, test } from '@playwright/test';

test('lists seeded schools with class counts', async ({ page }) => {
	await page.goto('/schools');

	await expect(
		page
			.getByRole('row', { name: /EMEF Monteiro Lobato/ })
			.locator('td')
			.nth(5)
	).toHaveText('3');
	await expect(
		page
			.getByRole('row', { name: /EMEI Cora Coralina/ })
			.locator('td')
			.nth(5)
	).toHaveText('1');
});

test('creates a school', async ({ page }) => {
	await page.goto('/schools');
	await page.getByRole('button', { name: 'Adicionar escola' }).click();

	await page.getByLabel('Nome', { exact: true }).fill('EMEF Teste E2E');
	await page.getByLabel('Endereço', { exact: true }).fill('Rua Teste, 1');
	await page.getByRole('dialog').getByLabel('Cidade', { exact: true }).fill('São Paulo');
	await page.getByLabel('Telefone', { exact: true }).fill('11988887777');
	await page.getByLabel('E-mail', { exact: true }).fill('teste@e2e.gov.br');
	await page.getByLabel('Diretor(a)', { exact: true }).fill('Diretor Teste');
	await page.getByRole('button', { name: 'Salvar' }).click();

	await expect(page.getByRole('row', { name: /EMEF Teste E2E/ })).toBeVisible();
});

test('edits a school', async ({ page }) => {
	await page.goto('/schools');

	await page.getByRole('button', { name: 'Adicionar escola' }).click();
	await page.getByLabel('Nome', { exact: true }).fill('EMEF Editar E2E');
	await page.getByLabel('Telefone', { exact: true }).fill('11977776666');
	await page.getByLabel('E-mail', { exact: true }).fill('editar@e2e.gov.br');
	await page.getByRole('button', { name: 'Salvar' }).click();
	await expect(page.getByRole('row', { name: /EMEF Editar E2E/ })).toBeVisible();

	await page.getByRole('button', { name: 'Editar EMEF Editar E2E' }).click();
	await page.getByLabel('Nome', { exact: true }).fill('EMEF Editada E2E');
	await page.getByRole('button', { name: 'Salvar' }).click();

	await expect(page.getByRole('row', { name: /EMEF Editada E2E/ })).toBeVisible();
});

test('blocks deleting a school that has classes', async ({ page }) => {
	await page.goto('/schools');
	await page.getByRole('button', { name: 'Excluir EMEF Monteiro Lobato' }).click();

	await expect(page.getByText(/possui 3 turma/)).toBeVisible();
	await expect(page.getByRole('button', { name: 'Excluir', exact: true })).toBeHidden();
	await page.getByRole('button', { name: 'Fechar' }).click();
	await expect(page.getByRole('row', { name: /EMEF Monteiro Lobato/ })).toBeVisible();
});

test('deletes a school without classes after confirming', async ({ page }) => {
	await page.goto('/schools');
	await page.getByRole('button', { name: 'Adicionar escola' }).click();
	await page.getByLabel('Nome', { exact: true }).fill('EMEF Excluir E2E');
	await page.getByLabel('Telefone', { exact: true }).fill('11966665555');
	await page.getByLabel('E-mail', { exact: true }).fill('excluir@e2e.gov.br');
	await page.getByRole('button', { name: 'Salvar' }).click();
	await expect(page.getByRole('row', { name: /EMEF Excluir E2E/ })).toBeVisible();

	await page.getByRole('button', { name: 'Excluir EMEF Excluir E2E' }).click();
	await page.getByRole('button', { name: 'Excluir', exact: true }).click();

	await expect(page.getByRole('row', { name: /EMEF Excluir E2E/ })).toBeHidden();
});

test('filters schools by search and city', async ({ page }) => {
	await page.goto('/schools');

	await page.getByLabel('Buscar por nome ou cidade', { exact: true }).fill('santos');
	await expect(page.getByRole('row', { name: /EMEF Paulo Freire/ })).toBeVisible();
	await expect(page.getByRole('row', { name: /EMEF Monteiro Lobato/ })).toBeHidden();

	await page.getByLabel('Buscar por nome ou cidade', { exact: true }).fill('');
	await page.getByLabel('Cidade', { exact: true }).selectOption('Campinas');
	await expect(page.getByRole('row', { name: /EMEF Anísio Teixeira/ })).toBeVisible();
	await expect(page.getByRole('row', { name: /EMEF Paulo Freire/ })).toBeHidden();
});
