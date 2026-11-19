import { test } from '@playwright/test';
import { runStep } from '../../../utils/StepReportUtil';
import { readTestData } from '../../../utils/ExcelTestDataUtil';
import { LoginPage } from '../../../pages/LoginPage';
import { AccountCreationPage } from '../../../pages/AccountCreationPage';
import { BaseUtils } from '../../../utils/BaseUtils';

test('DLROTC_4912 New Logo DFW010 Test', async ({ page }, testInfo) => {

	const testData = await readTestData(testInfo.title);
	const login = new LoginPage(page);
	const accountCreation = new AccountCreationPage(page);
	await runStep(page, testInfo, 'Navigate to Salesforce', async () => {
		await page.goto(testData.applicationUrl);
	});

	await runStep(page, testInfo, 'Login to Salesforce', async () => {
		await login.loginToSalesforce(testData.username, testData.password);
	});

	await runStep(page, testInfo, 'Navigate to Account Creation Page', async () => {
		await accountCreation.navigateToAccountCreation();
	});

	let salesAccountName = testData.salesAccountName+BaseUtils.getFormattedDateStamp("GU")+testData.country;
	await runStep(page, testInfo, 'Create and publish Global Ultimate Account', async () => {
		salesAccountName = await accountCreation.createSalesAccountAndPublish({
			...testData,
			salesAccountName,
		});
	});

	await runStep(page, testInfo, 'Change Record Type to Global Ultimate', async () => {
		await accountCreation.changeRecordType('Global Ultimate');
	});

	let customerAccountName = salesAccountName.replace("GU", "CU");
	await runStep(page, testInfo, 'Create and publish Customer Account', async () => {
		await accountCreation.navigateToAccountCreation();
		customerAccountName = await accountCreation.createCustomerAccountAndPublish(testData, customerAccountName, salesAccountName);
	});

	let salesAccountNameSA = customerAccountName.replace("CU", "SA");
	await runStep(page, testInfo, 'Create and publish Sales Account', async () => {
		await accountCreation.navigateToAccountCreation();
		salesAccountNameSA = await accountCreation.createSalesAccountWithPAAsCAAndPublish(testData, salesAccountNameSA, customerAccountName);
	});

	let legalEntityParentAccount = salesAccountNameSA.replace("SA", "LEP");
	await runStep(page, testInfo, 'Create and publish Legal Entity Parent Account', async () => {
		await accountCreation.navigateToAccountCreation();
		legalEntityParentAccount = await accountCreation.createLegalEntityParentAndPublish(testData, legalEntityParentAccount, salesAccountNameSA);
	});

	let legalEntityAccount = legalEntityParentAccount.replace("LEP", "LE");
	await runStep(page, testInfo, 'Create and publish Legal Entity Parent Account', async () => {
		await accountCreation.navigateToAccountCreation();
		legalEntityAccount = await accountCreation.createLegalEntityAndPublish(testData, legalEntityAccount, legalEntityParentAccount);
	});


});