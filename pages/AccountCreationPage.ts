import { expect, Page, type Locator } from '@playwright/test';
import type { SalesforceTestData } from '../utils/ExcelTestDataUtil';
import { PlaywrightUtil } from '../utils/PlaywrightUtil';

export class AccountCreationPage {
	private readonly playwright: PlaywrightUtil;

	constructor(private readonly page: Page) {
		this.playwright = new PlaywrightUtil(page);
	}

	private async openNewAccount(recordType: string): Promise<Locator> {		

		const recordTypeOption = this.page.getByRole('radio', { name: recordType, exact: true });
		if (await recordTypeOption.isVisible().catch(() => false)) {
			await this.playwright.click(recordTypeOption.locator('..').locator('label'));
			await this.playwright.click(this.page.getByRole('button', { name: /next|continue/i }));
		}

		const accountDialog = this.page.getByRole('dialog', {
			name: `New Account Management: ${recordType}`,
			exact: true,
		});
		await this.playwright.waitForVisible(accountDialog);
		return accountDialog;
	}

	private async fillAccountAddress(data: SalesforceTestData): Promise<void> {
		//await this.page.waitForTimeout(60000);
		await this.chooseOption('Region', data.billingRegion);
		await this.chooseOption('Select Address (Country/Territory)', data.billingCountry);
		// await expect(
		// 	this.page.getByRole('combobox', { name: 'Select Address (Country/Territory)', exact: true }),
		// ).toHaveText(data.billingCountry);
		// await expect(
		// 	this.page.getByRole('combobox', { name: 'Select Address (State/Province)', exact: true }),
		// ).toHaveText(data.billingState);
		await this.playwright.fill(this.page.getByLabel('Select Address (Street)', { exact: true }), data.billingStreet);
		await this.playwright.fill(this.page.getByLabel('Select Address (City)', { exact: true }), data.billingCity);
		await this.chooseOption('Select Address (State/Province)', data.billingState);
		await this.playwright.fill(this.page.getByLabel('Select Address (ZIP/Postal Code)', { exact: true }), data.billingPostalCode);
	}

	private async selectRegion(value: string): Promise<void> {		
		const firstOption = this.page.locator(`//button[@aria-label='Region']`);
		await this.playwright.click(firstOption);
		await this.playwright.click(this.page.getByRole('option', { name: value, exact: true }));
	}

	private async chooseOption(label: string, value: string): Promise<void> {
		const combobox = this.page.getByRole('combobox', { name: label, exact: true });
		await this.playwright.selectFromDropdown(combobox, this.page.getByRole('option', { name: value, exact: true }), value);
	}

	private async approveAndSave(): Promise<void> {
		await this.chooseOption('Status', 'Approved');
		await this.playwright.click(this.page.getByRole('button', { name: 'Save', exact: true }));
	}

	private async publishAccount(accountName: string): Promise<void> {
		const publishButton = this.page.getByRole('button', { name: 'Publish', exact: true });
		if (await publishButton.isVisible().catch(() => false)) {
			await this.playwright.click(publishButton);
		} else {
			await this.playwright.click(this.page.getByRole('button', { name: 'Show more actions', exact: true }));
			await this.playwright.click(this.page.getByRole('menuitem', { name: 'Publish', exact: true }));
		}
		await this.playwright.waitForTimeout(60000);
		//await this.waitForAccountOwnerPopulated(accountName);
	}

	private async waitForAccountOwnerPopulated(accountName: string): Promise<void> {
		await this.playwright.waitForTimeout(30000);
		await this.waitForAccountNameDisplayed(accountName);
		const accountOwnerField = this.page
			.locator('records-record-layout-item, .slds-form-element')
			.filter({ has: this.page.getByText('Account Owner', { exact: true }) })
			.first();
		await this.playwright.waitForVisible(accountOwnerField);
		await expect
			.poll(
				async () => {
					const text = await accountOwnerField.innerText().catch(() => '');
					return text.replace('Account Owner', '').trim().length > 0;
				},
				{ message: 'Account Owner was not populated after publish', timeout: 60000 },
			)
			.toBe(true);
	}

	private async waitForAccountNameDisplayed(accountName: string): Promise<void> {
		await this.playwright.waitForVisible(this.page.getByText(accountName, { exact: true }).first());
	}

	async navigateToAccountCreation(): Promise<void> {
		await this.playwright.click(this.page.getByRole('link', { name: 'Accounts', exact: true }));
		await this.playwright.click(this.page.getByRole('button', { name: 'New', exact: true }));
		await this.playwright.click(this.page.getByText('Request for New Account', { exact: true }));
	}

	private async scrollUntilVisible(locator: Locator, maxScrolls = 30): Promise<void> {
		const viewport = this.page.viewportSize();
		const viewportHeight = viewport?.height ?? 720;
		const viewportWidth = viewport?.width ?? 1280;
		await this.page.mouse.move(viewportWidth / 2, viewportHeight / 2);
		for (let attempt = 0; attempt < maxScrolls; attempt++) {
			const box = await locator.boundingBox().catch(() => null);
			if (box && box.y >= 0 && box.y + box.height <= viewportHeight) {
				return;
			}
			await this.page.mouse.wheel(0, box && box.y > viewportHeight ? 400 : -400);
			await this.page.waitForTimeout(300);
		}
		await locator.waitFor({ state: 'visible' });
	}

	async changeRecordType(recordType: string): Promise<void> {
		const changeRecordTypeButton = this.page.getByRole('button', { name: /change record type/i });
		await this.scrollUntilVisible(changeRecordTypeButton);
		await this.playwright.click(changeRecordTypeButton);
		const recordTypeLabel = this.page.locator(
			`xpath=//span[contains(@class,'slds-form-element__label') and normalize-space(.)='${recordType}']`,
		);
		await this.playwright.click(recordTypeLabel);
		await this.playwright.click(this.page.getByRole('button', { name: 'Next', exact: true }));
		await this.playwright.click(this.page.getByRole('button', { name: 'Save', exact: true }));
		await this.playwright.waitForTimeout(40000);
	}

	async createSalesAccountAndPublish(data: SalesforceTestData): Promise<string> {
		const accountDialog = await this.openNewAccount(data.salesRecordType);
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Account Name', exact: true }), data.salesAccountName);
		const website = `www.${data.salesAccountName.replace(/\s+/g, '').toLowerCase()}.com`;
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Website', exact: true }), website);
		await this.chooseOption('Lead Source', data.leadSource);
		await this.chooseOption('New Account Reason', data.newAccountReason);
		await this.chooseOption('Lead Source Detail', data.leadSourceDetail);
		//await this.page.getByLabel('Lead Source Detail', { exact: true }).fill(data.leadSourceDetail);
		await this.fillAccountAddress(data);
		await this.approveAndSave();
		await this.publishAccount(data.salesAccountName);
		return data.salesAccountName;
	}

	async createLegalEntityAccountAndPublish(
		data: SalesforceTestData,
		salesAccountName: string,
	): Promise<string> {
		const accountDialog = await this.openNewAccount(data.legalEntityRecordType);
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Account Name', exact: true }), data.legalEntityName);
		const parentAccount = accountDialog.getByRole('combobox', { name: 'Parent Account', exact: true });
		await this.playwright.fill(parentAccount, salesAccountName);
		await this.playwright.click(accountDialog.getByRole('option', { name: salesAccountName, exact: true }));
		await this.chooseOption('Currency', data.opportunityCurrency);
		await this.fillAccountAddress(data);
		await this.approveAndSave();
		await this.publishAccount(data.legalEntityName);
		return data.legalEntityName;
	}

	private async selectParentAccount(accountDialog: Locator, parentAccountName: string): Promise<void> {
		const parentAccount = accountDialog.getByRole('combobox', { name: 'Parent Account', exact: true });
		await this.playwright.typeCharacterByCharacter(parentAccount, parentAccountName);
		const escapedParentName = parentAccountName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		await this.playwright.click(accountDialog.getByRole('option', { name: new RegExp(`^${escapedParentName}`) }).first());
	}

	async createCustomerAccountAndPublish(data: SalesforceTestData, customerAccountName: string, parentAccountName: string): Promise<string> {
		const accountDialog = await this.openNewAccount('Customer');
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Account Name', exact: true }), customerAccountName);
		const website = `www.${customerAccountName.replace(/\s+/g, '').toLowerCase()}.com`;
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Website', exact: true }), website);
		await this.selectParentAccount(accountDialog, parentAccountName);
			await this.chooseOption('Lead Source', data.leadSource);
		await this.chooseOption('New Account Reason', data.newAccountReason);
		await this.chooseOption('Lead Source Detail', data.leadSourceDetail);
		await this.fillAccountAddress(data);
		await this.approveAndSave();
		await this.publishAccount(customerAccountName);
		return customerAccountName;
	}

	async createSalesAccountWithPAAsCAAndPublish(data: SalesforceTestData, salesACCName: string, parentAccountName: string): Promise<string> {
		const accountDialog = await this.openNewAccount('Sales Account');
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Account Name', exact: true }), salesACCName);
		const website = `www.${salesACCName.replace(/\s+/g, '').toLowerCase()}.com`;
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Website', exact: true }), website);
		await this.selectParentAccount(accountDialog, parentAccountName);
			await this.chooseOption('Lead Source', data.leadSource);
		await this.chooseOption('New Account Reason', data.newAccountReason);
		await this.chooseOption('Lead Source Detail', data.leadSourceDetail);
		await this.fillAccountAddress(data);
		await this.approveAndSave();
		await this.publishAccount(salesACCName);
		return salesACCName;
	}

	async createLegalEntityParentAndPublish(data: SalesforceTestData, slegalEntityParentName: string, parentAccountName: string): Promise<string> {
		const accountDialog = await this.openNewAccount('Legal Entity Parent');
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Account Name', exact: true }), slegalEntityParentName);
		const website = `www.${slegalEntityParentName.replace(/\s+/g, '').toLowerCase()}.com`;
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Website', exact: true }), website);
		await this.selectParentAccount(accountDialog, parentAccountName);
			await this.chooseOption('Lead Source', data.leadSource);
		await this.chooseOption('New Account Reason', data.newAccountReason);
		await this.chooseOption('Lead Source Detail', data.leadSourceDetail);
		await this.fillAccountAddress(data);
		await this.approveAndSave();
		await this.publishAccount(slegalEntityParentName);
		return slegalEntityParentName;
	}

	async createLegalEntityAndPublish(data: SalesforceTestData, legalEntityName: string, parentAccountName: string): Promise<string> {
		const accountDialog = await this.openNewAccount('Legal Entity');
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Account Name', exact: true }), legalEntityName);
		const website = `www.${legalEntityName.replace(/\s+/g, '').toLowerCase()}.com`;
		await this.playwright.fill(accountDialog.getByRole('textbox', { name: 'Website', exact: true }), website);
		await this.selectParentAccount(accountDialog, parentAccountName);
			await this.chooseOption('Lead Source', data.leadSource);
		await this.chooseOption('New Account Reason', data.newAccountReason);
		await this.chooseOption('Lead Source Detail', data.leadSourceDetail);
		await this.fillAccountAddress(data);
		await this.approveAndSave();
		await this.publishAccount(legalEntityName);
		return legalEntityName;
	}
}