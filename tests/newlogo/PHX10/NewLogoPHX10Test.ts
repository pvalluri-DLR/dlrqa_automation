import { test } from '@playwright/test';
import { runStep } from '../../../utils/StepReportUtil';
import { readTestData } from '../../../utils/ExcelTestDataUtil';
import { LoginPage } from '../../../pages/LoginPage';
import { AccountCreationPage } from '../../../pages/AccountCreationPage';

test('New Logo PHX10 Test', async ({ page }, testInfo) => {

	const testData = await readTestData(testInfo.title);
	const login = new LoginPage(page);
	const accountCreation = new AccountCreationPage(page);
	await runStep(page, testInfo, 'Navigate to Salesforce', async () => {
		await page.goto(testData.applicationUrl);
	});

	// await runStep(page, testInfo, 'Login to Salesforce', async () => {
	// 	await login.loginToSalesforce(testData.username, testData.password);
	// });

	// let salesAccountName = '';
	// await runStep(page, testInfo, 'Create and publish Sales Account', async () => {
	// 	salesAccountName = await accountCreation.createSalesAccountAndPublish(testData);
	// });

	// await runStep(page, testInfo, 'Create and publish Legal Entity', async () => {
	// 	await accountCreation.createLegalEntityAccountAndPublish(testData, salesAccountName);
	// });
});