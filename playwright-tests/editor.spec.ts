import { test, expect } from '@playwright/test';

// TODO figure out per-browser users in db, then re-enable
// parallelism is playwright.config.ts

test.beforeEach(async ({ page }) => {
  await page.goto('/page');
});

test('window title', async ({ page }) => {
  await expect(page).toHaveTitle(/🍊✅/);
});

test('page contents', async ({ page }) => {
  await expect(page.getByText('Hello, world!')).toBeVisible();
});

test('page title', async ({ page }) => {
  const title = await page.getByTestId('editable-title');
  await expect(title).toHaveText('TestPage1');
});

test('should bring up search results', async ({ page }) => {
  const newSearch = page.getByPlaceholder('Search or Create');
  await newSearch.fill('test');
  await expect(page.getByTestId('search-result')).toHaveText('TestPage1');
});

test('should select search result', async ({ page }) => {
  const newSearch = page.getByPlaceholder('Search or Create');
  await newSearch.fill('test');
  const isSelectedItemPresent = await page.$('.selected-item') !== null;
  expect(isSelectedItemPresent).toBeTruthy();
});

test('backspace deselects search result', async ({ page }) => {
  const newSearch = page.getByPlaceholder('Search or Create');
  await newSearch.fill('test');
  await page.keyboard.press('Backspace');
  const isSelectedItemPresent = await page.$('.selected-item') !== null;
  expect(isSelectedItemPresent).toBeFalsy();
});

test('escape closes search results', async ({ page }) => {
  const newSearch = page.getByPlaceholder('Search or Create');
  await newSearch.fill('test');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('search-result')).not.toBeVisible();
});

test('renaming page reflected in search results', async ({ page }) => {
  const title = page.getByText('TestPage1');
  await title.focus();
  await title.fill('NewTitle');
  const newSearch = page.getByPlaceholder('Search or Create');
  await newSearch.fill('new');
  await expect(page.getByTestId('search-result')).toHaveText('NewTitle');
  await page.keyboard.press('Escape');
  const newTitle = page.getByText('NewTitle');
  await newTitle.focus();
  await newTitle.fill('TestPage1');
});