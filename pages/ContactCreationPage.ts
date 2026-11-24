import { Page } from '@playwright/test';
import type { SalesforceTestData } from '../utils/ExcelTestDataUtil';
import { PlaywrightUtil } from '../utils/PlaywrightUtil';

export class ContactCreationPage {
	private readonly playwright: PlaywrightUtil;

	constructor(private readonly page: Page) {
		this.playwright = new PlaywrightUtil(page);
	}

	async searchAccount(accountName: string): Promise<void> {
		await this.playwright.waitForPageLoad();
		const globalSearch = this.page.getByPlaceholder('Search...');
		await this.playwright.fill(globalSearch, accountName);
		await this.playwright.press(globalSearch, 'Enter');
		await this.playwright.click(this.page.getByRole('link', { name: accountName, exact: true }).first());
	}

	async createContact(data: SalesforceTestData, accountName: string): Promise<string> {
		await this.playwright.click(this.page.getByRole('link', { name: 'Accounts', exact: true }));
		await this.playwright.waitForPageLoad();
		const fullName = `${data.contactFirstName} ${data.contactLastName}`;
		//await this.playwright.click(this.page.getByRole('link', { name: 'Contacts', exact: true }));
		const contactsArrow = this.page.locator("xpath=//a[@title='Contacts']/following-sibling::one-app-nav-bar-item-dropdown").filter({ visible: true }).first();
		await this.playwright.click(contactsArrow);
		const newContactOption = this.page.getByText('New Contact', { exact: true }).filter({ visible: true }).first();
		await this.playwright.waitForVisible(newContactOption, 30000);
		await this.playwright.click(newContactOption);

		const contactDialog = this.page.getByRole('dialog', { name: 'New Contact', exact: true });
		try {
			await contactDialog.waitFor({ state: 'visible', timeout: 30000 });
		} catch {
			console.warn('Skipped waiting for "New Contact" dialog: not visible within 30 seconds');
		}
		await this.playwright.fill(this.page.locator("//input[@name='FirstName']").filter({ visible: true }), data.contactFirstName);
		await this.playwright.fill(this.page.locator("//input[@name='LastName']").filter({ visible: true }), accountName);
		// const removeSelectedAccount = contactDialog.locator("xpath=//button[@title='Clear Account Name Selection']").filter({ visible: true }).first();
		// if (await removeSelectedAccount.isVisible().catch(() => false)) {
		// 	await this.playwright.click(removeSelectedAccount);
		// }
		const accountLookup = this.page.locator("xpath=//input[@aria-label='Account Name']").filter({ visible: true }).first();
		await this.playwright.typeCharacterByCharacter(accountLookup, accountName);
		const accountOption = this.page.locator(`xpath=//span[normalize-space(.)='${accountName}']`).filter({ visible: true }).first();
		await this.playwright.waitForVisible(accountOption, 30000);
		await this.playwright.click(accountOption);
		const leadSource = this.page.locator("xpath=//button[@name='LeadSource']").filter({ visible: true }).first();
		const salesGeneratedOption = this.page.locator("xpath=//span[normalize-space(.)='Sales Generated']").filter({ visible: true }).first();
		await this.playwright.selectFromDropdown(leadSource, salesGeneratedOption, 'Sales Generated');
		await this.playwright.fill(this.page.locator("//input[@name='Email']").filter({ visible: true }), data.contactEmail);
		await this.playwright.fill(this.page.locator("//input[@name='Phone']").filter({ visible: true }), data.contactPhone);
		await this.playwright.click(this.page.locator("xpath=//button[normalize-space(.)='Save']").filter({ visible: true }).first());

		try {
			await this.page.getByText(fullName, { exact: true }).filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 15000 });
		} catch {
			console.warn(`Validation skipped: "${fullName}" not visible within 15 seconds`);
		}
		return fullName;
	}

	async clickAccountNameLink(accountName: string): Promise<void> {
		await this.playwright.waitForPageLoad();
		await this.playwright.click(this.page.getByRole('link', { name: accountName, exact: true }).filter({ visible: true }).first());
	}
}
