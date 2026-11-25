import { test } from '@playwright/test';
import { runStep } from '../../../utils/StepReportUtil';
import { readTestData, readdataBySheetname } from '../../../utils/ExcelTestDataUtil';
import { LoginPage } from '../../../pages/LoginPage';
import { AccountCreationPage } from '../../../pages/AccountCreationPage';
import { ContactCreationPage } from '../../../pages/ContactCreationPage';
import { BaseUtils } from '../../../utils/BaseUtils';
import { MsaPage } from '../../../pages/msaPage';
import { OpportunityPage } from '../../../pages/OpportunityPage';
import { ProductConfigurationPage } from '../../../pages/ProductConfigurationPage';

test('DLROTC_4912 New Logo DFW010 Test', async ({ page }, testInfo) => {

	const salesforceData = await readTestData(testInfo.title, { workbookFile: 'test-data/DLROTC_4912.xlsx', sheetName: 'SalesforceData' });
	const spaceProductData = await readdataBySheetname({ workbookFile: 'test-data/DLROTC_4912.xlsx', sheetName: 'SpaceProductConfiguration' });
	const login = new LoginPage(page);
	const accountCreation = new AccountCreationPage(page);
	await runStep(page, testInfo, 'Navigate to Salesforce', async () => {
		await page.goto(salesforceData.applicationUrl);
	});

	await runStep(page, testInfo, 'Login to Salesforce', async () => {
		await login.loginToSalesforce(salesforceData.username, salesforceData.password);
	});

	// await runStep(page, testInfo, 'Navigate to Account Creation Page', async () => {
	// 	await accountCreation.navigateToAccountCreation();
	// });

	// let salesAccountName = salesforceData.salesAccountName+BaseUtils.getFormattedDateStamp("GU")+salesforceData.country;
	// await runStep(page, testInfo, 'Create and publish Global Ultimate Account', async () => {
	// salesAccountName = await accountCreation.createSalesAccountAndPublish({
	// 		...salesforceData,
	// 		salesAccountName,
	// 	});
	// });

	// await runStep(page, testInfo, 'Change Record Type to Global Ultimate', async () => {
	// 	await accountCreation.changeRecordType('Global Ultimate');
	// });

	// let customerAccountName = salesAccountName.replace("GU", "CU");
	// await runStep(page, testInfo, 'Create and publish Customer Account', async () => {
	// 	await accountCreation.navigateToAccountCreation();
	// 	customerAccountName = await accountCreation.createCustomerAccountAndPublish(salesforceData, customerAccountName, salesAccountName);
	// });

	// let salesAccountNameSA = customerAccountName.replace("CU", "SA");
	// await runStep(page, testInfo, 'Create and publish Sales Account', async () => {
	// 	await accountCreation.navigateToAccountCreation();
	// 	salesAccountNameSA = await accountCreation.createSalesAccountWithPAAsCAAndPublish(salesforceData, salesAccountNameSA, customerAccountName);
	// });

	// let legalEntityParentAccount = salesAccountNameSA.replace("SA", "LEP");
	// await runStep(page, testInfo, 'Create and publish Legal Entity Parent Account', async () => {
	// 	await accountCreation.navigateToAccountCreation();
	// 	legalEntityParentAccount = await accountCreation.createLegalEntityParentAndPublish(salesforceData, legalEntityParentAccount, salesAccountName);
	// });

	// let legalEntityAccount = legalEntityParentAccount.replace("LEP", "LE");
	// await runStep(page, testInfo, 'Create and publish Legal Entity Account', async () => {
	// 	await accountCreation.navigateToAccountCreation();
	// 	legalEntityAccount = await accountCreation.createLegalEntityAndPublish(salesforceData, legalEntityAccount, legalEntityParentAccount);
	// });

	//  //let salesAccountNameSA = "TestQA__1120261432_SA_USA";
	// // let legalEntityAccount = "TestQA__1120261432_LE_USA";
	//  const contactCreation = new ContactCreationPage(page);
	// await runStep(page, testInfo, 'Create Contact', async () => {
	// 	await contactCreation.createContact(salesforceData, salesAccountNameSA);
	// });

	// await runStep(page, testInfo, 'Click Account Name on Contacts page to Create MSA', async () => {
	// 	await contactCreation.clickAccountNameLink(salesAccountNameSA);
	// });
	// let currentUrl = '';
	// await runStep(page, testInfo, 'Enter MSA Contact Details', async () => {
	// 	const msaPage = new MsaPage(page);
	// 	await msaPage.enterContactDetails('NAM', legalEntityAccount, salesAccountNameSA);
	// 	currentUrl = page.url();
	// });

	// await runStep(page, testInfo, 'Search and select user Bob Luparello', async () => {
	// 	const msaPage = new MsaPage(page);
	// 	await msaPage.searchAndSelectUser('Bob Luparello', currentUrl);
	// });

	// await runStep(page, testInfo, 'Generate DLR GMSA Template & Logout Proxy User', async () => {		
	// 	const msaPage = new MsaPage(page);
	// 	await msaPage.clickGenerateDLRGMSATemplate();
	// 	await msaPage.clickGenerate();
	// });

	// await runStep(page, testInfo, 'Verify Document Generated and click OK', async () => {
	// 	const msaPage = new MsaPage(page);
	// 	await msaPage.verifyDocumentGeneratedAndClickOk();
	// });


	// await runStep(page, testInfo, 'Generate DLR GMSA Template & Logout Proxy User', async () => {
	// 	const msaPage = new MsaPage(page);
	// 	await msaPage.clickSubmitToContractManagement();
	// 	await msaPage.submitToContractManagementFlow('Contract Signature / Abstraction', 'Wet Signature');
	// 	await msaPage.logoutProxyUser();
	// 	await page.goto(currentUrl);
	// });

	// await runStep(page, testInfo, 'Search and select user Brittany Gerritsen', async () => {
	// 	const msaPage = new MsaPage(page);
	// 	await msaPage.searchAndSelectUser('Brittany Gerritsen', currentUrl);
	// 	await msaPage.clickMarkAgreementFullySigned();
	// 	await msaPage.logoutProxyUser();
	// 	await page.goto(currentUrl);
	// 	await msaPage.clickAccountNumber();

	// });

	// await runStep(page, testInfo, 'Enter Opportunity Values', async () => {
	// 	const opportunityPage = new OpportunityPage(page);
	// 	await opportunityPage.clickNewOpportunity();
	// 	await opportunityPage.enterOpportunityValues({
	// 		transactionType: salesforceData.transactionType,
	// 		cAndAOpportunity: salesforceData.cAndAOpportunity,
	// 		serviceFabric: salesforceData.serviceFabric,
	// 		annualizedGaap: salesforceData.annualizedGaap,
	// 		initialContact: salesAccountNameSA,
	// 		primaryUseCase: salesforceData.primaryUseCase,
	// 		proposedMarket: salesforceData.proposedMarket,
	// 	});
	// 	await opportunityPage.selectProperty('DFW10');
	// 	await opportunityPage.changeOpportunityOwner('Caitlin Dwyer');
	// });

	// await runStep(page, testInfo, 'Draft Quote', async () => {
	// 	const opportunityPage = new OpportunityPage(page);
	// 	await opportunityPage.clickNewOracleQuote();
	// });

	
   let quoteNumber = "CPQ-50435";
let salesAccountNameSA = "TestQA__1124261051_SA_USA";
	await runStep(page, testInfo, 'Verify Quote is generated', async () => {
		const opportunityPage = new OpportunityPage(page);
		
		await opportunityPage.searchAndSelectAccount(salesAccountNameSA);
		//await opportunityPage.clickReturnToOpportunity();
		//quoteNumber = await opportunityPage.verifyQuoteGenerated();
		await opportunityPage.clickEditOracleQuote(quoteNumber);
	});

	await runStep(page, testInfo, 'Configure products for new CPQ (Deployments #1 and #2)', async () => {
		const productConfigurationPage = new ProductConfigurationPage(page);
		await productConfigurationPage.productConfigurationForNewLogo(salesforceData.suite, 'DFW010');
	});


 });