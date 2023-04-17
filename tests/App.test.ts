import { test, expect } from '@playwright/test';

test('displays latitude and longitude after submitting a valid city and country', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Select a country and wait for the cities to load
  const countrySelector = await page.waitForSelector('select:nth-child(1)');
  await countrySelector.selectOption({ value: 'US' });
  await page.waitForSelector('select:nth-child(2) option[value="New York"]');

  // Select a city and click the submit button
  const citySelector = await page.waitForSelector('select:nth-child(2)');
  await citySelector.selectOption({ value: 'New York' });
  const submitButton = await page.waitForSelector('button');
  await submitButton.click();

  // Wait for the latitude and longitude to be displayed
  const latLngText = await page.waitForSelector('p');

  // Assert that the latitude and longitude are correct
  const expectedLatLngRegex = /Latitude: (\d+\.\d+), Longitude: (-\d+\.\d+)/;
  const actualLatLngText = await latLngText.textContent();
  expect(actualLatLngText).toMatch(expectedLatLngRegex);
});

test('disables the city selector until a country is selected', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Check that the city selector is disabled initially
  const citySelector = await page.waitForSelector('select:nth-child(2)');
  const citySelectorHandle = await citySelector.evaluateHandle((el) => el);
  const citySelectorLocator = citySelectorHandle.locator();
  await expect(citySelectorLocator).toBeDisabled();

  // Select a country and wait for the cities to load
  const countrySelector = await page.waitForSelector('select:nth-child(1)');
  await countrySelector.selectOption({ value: 'US' });
  await page.waitForSelector('select:nth-child(2) option[value="New York"]');

  // Check that the city selector is enabled
  await expect(citySelectorLocator).toBeEnabled();
});

test('displays an error message when the location is not found', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Select a country and wait for the cities to load
  const countrySelector = await page.waitForSelector('select:nth-child(1)');
  await countrySelector.selectOption({ value: 'US' });
  await page.waitForSelector('select:nth-child(2) option[value="Nonexistent City"]');

  // Select a non-existent city and click the submit button
  const citySelector = await page.waitForSelector('select:nth-child(2)');
  await citySelector.selectOption({ value: 'Nonexistent City' });
  const submitButton = await page.waitForSelector('button');
  await submitButton.click();

  // Wait for the error message to be displayed
  const errorMessage = await page.waitForSelector('p');

  console.log(await errorMessage.textContent()); // Debugging statement

  // Assert that the error message is displayed correctly
  const expectedErrorMessage = 'Location not found';
  const actualErrorMessage = await errorMessage.textContent();
  expect(actualErrorMessage).toContain(expectedErrorMessage);
});