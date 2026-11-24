import { Page } from '@playwright/test';
import { PlaywrightUtil } from '../utils/PlaywrightUtil';

export class ProductConfigurationPage {
	private readonly playwright: PlaywrightUtil;

	constructor(private readonly page: Page) {
		this.playwright = new PlaywrightUtil(page);
	}

	async selectSuite(suite: string): Promise<void> {
		const suiteInput = this.page.locator("xpath=//input[@type='text' and contains(@id, 'suite_selector')]").filter({ visible: true }).first();
		const suiteOption = this.page.locator(`xpath=//*[@id='oj-listbox-results-suite_selector_pF-combobox']/li[*[@aria-label='${suite}']]`).filter({ visible: true }).first();

		await this.playwright.waitForPageLoad();
		await this.playwright.click(suiteInput);
		await this.playwright.fill(suiteInput, suite);
		await suiteOption.waitFor({ state: 'visible', timeout: 30000 });
		await this.playwright.click(suiteOption);
		await this.playwright.waitForPageLoad();
	}

	async selectProductCategory(label: string): Promise<void> {
		const categoryTile = this.page.getByText(label, { exact: true }).filter({ visible: true }).first();
		await this.playwright.waitForPageLoad();
		await this.playwright.click(categoryTile);
		await this.playwright.waitForPageLoad();
	}

	async clickProductName(productGroupName: string): Promise<void> {
		await this.clickProductLink(productGroupName);
	}

	async clickProductConfig(productConfig: string): Promise<void> {
		const configTab = this.page.locator(`xpath=//a[contains(@id,'v2_productCategoryTabs') and @title='${productConfig}']`).filter({ visible: true }).first();
		await this.playwright.waitForPageLoad();
		await this.playwright.click(configTab);
		await this.playwright.waitForPageLoad();
	}

	async selectAddProductsTab(): Promise<void> {
		await this.clickProductConfig('ADD PRODUCTS');
	}

	async selectSpaceTab(): Promise<void> {
		await this.clickProductConfig('SPACE');
	}

	private async clickProductLink(title: string): Promise<void> {
		const link = this.page.locator(`xpath=//a[@title='${title}']`).filter({ visible: true }).first();
		await this.playwright.waitForPageLoad();
		await this.playwright.click(link);
		await this.playwright.waitForPageLoad();
	}
}
