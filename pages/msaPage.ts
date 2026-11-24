import { Page, expect } from '@playwright/test';
import { PlaywrightUtil } from '../utils/PlaywrightUtil';

export class MsaPage {
	private readonly playwright: PlaywrightUtil;

	constructor(private readonly page: Page) {
		this.playwright = new PlaywrightUtil(page);
	}

	async createGoverningTermsAgreementRecord(): Promise<void> {
		await this.playwright.click(this.page.getByRole('button', { name: 'Create Governing Terms Agreement Record', exact: true }));
	}

	async enterContactDetails(salesLeadingRegion: string, customerContractingEntity: string, customerContactSignatoryName: string): Promise<void> {
		await this.createGoverningTermsAgreementRecord();
		await this.selectSalesLeadingRegion(salesLeadingRegion);
		await this.typeAndSelectSuggestion('Customer Contracting Entity', customerContractingEntity);
		await this.typeAndSelectSuggestion('Customer Contact Signatory Name', customerContactSignatoryName);	
		await this.clickSave();
	}

	private async typeAndSelectSuggestion(label: string, value: string): Promise<void> {
		//await this.playwright.click(this.page.getByRole('button', { name: `Edit ${label}` }).filter({ visible: true }).first());
		await this.playwright.typeCharacterByCharacter(this.page.getByLabel(label).filter({ visible: true }).first(), value);
		await this.playwright.click(this.page.locator("xpath=(//*[normalize-space(.)='Search Results']/following::*[self::a or @role='option'])[1]").filter({ visible: true }).first());
	}

	async clickSave(): Promise<void> {
		await this.playwright.click(this.page.locator("xpath=//button[normalize-space(.)='Save']").filter({ visible: true }).first());
	}

	async searchAndSelectUser(userName: string, url: string): Promise<void> {	
		await this.page.waitForTimeout(20000);
		await this.playwright.waitForPageLoad();
		await this.playwright.click(this.page.locator("xpath=//div[@class='slds-global-header__item slds-global-header__item_search']//button").filter({ visible: true }).first());
		await this.page.keyboard.type(userName, { delay: 100 });		
		await this.playwright.waitForPageLoad();
		await this.playwright.click(this.page.getByRole('option').filter({ has: this.page.getByText(userName, { exact: true }) }).filter({ visible: true }).first());
		await this.playwright.waitForPageLoad();
		await this.playwright.click(this.page.locator("xpath=//*[self::a or self::button][normalize-space(.)='User Detail' or normalize-space(.)='User Details']").filter({ visible: true }).first());
		await this.playwright.waitForPageLoad();
		await this.clickLogin();
		await this.page.goto(url);
	}

	async clickLogin(): Promise<void> {
		const loginFrame = this.page.frameLocator("xpath=//iframe[contains(@name,'vfFrameId')]");
		await this.playwright.click(loginFrame.locator("xpath=//div[@class='pbHeader']//input[@name='login']").filter({ visible: true }).first());
		await this.page.waitForLoadState('domcontentloaded');
	}

	async selectRequestType(requestType: string): Promise<void> {
		const requestTypeCombobox = this.page.locator("xpath=//span[text()='Request Type:']/../..//lightning-combobox").filter({ visible: true }).first();
		await this.playwright.selectFromDropdown(requestTypeCombobox, this.page.getByRole('option', { name: requestType, exact: true }), requestType);
	}

	async selectSignatureMethod(signatureMethod: string): Promise<void> {
		const signatureMethodCombobox = this.page.locator("xpath=//label[text()='Signature Method:']/../..//lightning-base-combobox").filter({ visible: true }).first();
		await this.playwright.selectFromDropdown(signatureMethodCombobox, this.page.getByRole('option', { name: signatureMethod, exact: true }), signatureMethod);
	}

	async submitToContractManagementFlow(requestType: string, signatureMethod: string): Promise<void> {
		await this.selectRequestType(requestType);
		await this.selectSignatureMethod(signatureMethod);
		await this.playwright.waitForPageLoad();
		await this.selectFirstFileAndClickNext();
		await this.clickSubmitToContractManagementButton();	
		await this.playwright.waitForPageLoad();
	}

	async selectFileName(): Promise<void> {
		await this.playwright.click(this.page.locator("xpath=//td[@data-label = 'File Name']/..//td//span[@class='slds-radio']").filter({ visible: true }).first());
	}

	async selectFirstFileAndClickNext(): Promise<void> {
		await this.selectFileName();
		await this.playwright.click(this.page.locator("xpath=//button[normalize-space(.)='Next']").filter({ visible: true }).first());
	}

	async clickMarkAgreementFullySigned(): Promise<void> {
		await this.playwright.waitForPageLoad();
		const loginFrame = this.page.frameLocator("xpath=//iframe[contains(@name,'vfFrameId')]");
		await this.playwright.click(loginFrame.locator("xpath=//a[normalize-space(.)='Mark Agreement Fully Signed']").filter({ visible: true }).first());
		await this.playwright.waitForPageLoad();
	}

	async clickAccountNumber(): Promise<void> {
		await this.playwright.click(this.page.locator("xpath=(//*[normalize-space(.)='Account']/following::a)[1]").filter({ visible: true }).first());
	}

	async selectSalesLeadingRegion(region: string): Promise<void> {
		await this.playwright.click(this.page.getByRole('button', { name: 'Edit Sales Leading Region' }).filter({ visible: true }).first());
		await this.playwright.selectFromDropdown(
			this.page.getByRole('combobox', { name: 'Sales Leading Region' }).filter({ visible: true }).first(),
			this.page.getByRole('option', { name: region, exact: true }).filter({ visible: true }).first(),
			region,
		);
	}

	async clickGenerateDLRGMSATemplate(): Promise<void> {
		const generateGMSATemplateFrame = this.page.frameLocator("xpath=//iframe[contains(@name,'vfFrameId')]");
        await this.playwright.click(generateGMSATemplateFrame.locator("xpath=//a[normalize-space(.)='Generate DLR GMSA Template']").filter({ visible: true }).first());
    	await this.playwright.waitForPageLoad();
	}
	async clickGenerate(): Promise<void> {
		const msaFrame = this.page.frameLocator("xpath=(//iframe[contains(@name,'vfFrameId')])[last()]");
        await this.playwright.click(msaFrame.locator("xpath=//input[@value='Generate']").filter({ visible: true }).first());
    	await this.playwright.waitForPageLoad();
		const msaFrameAfterGenerate = this.page.frameLocator("xpath=(//iframe[contains(@name,'vfFrameId')])[last()]");
		await msaFrameAfterGenerate.locator('body').waitFor({ state: 'visible' });
    }
	async verifyDocumentGeneratedAndClickOk(): Promise<void> {
		// await expect(this.page.locator("xpath=//*[normalize-space(.)='Document Generated']").filter({ visible: true }).first()).toBeVisible({ timeout: 60 * 1000 });
		const msaFrame = this.page.frameLocator("xpath=(//iframe[contains(@name,'vfFrameId')])[last()]");
		await this.playwright.click(msaFrame.locator("xpath=//*[*/*[text() = 'Document Generated']]//*[@type='submit' and @value = 'OK']").filter({ visible: true }).first());
		await this.page.waitForLoadState('domcontentloaded');
	}

	async logoutProxyUser(): Promise<void> {
        await this.playwright.click(this.page.getByRole('link', { name: /^Log out as .+$/i }));
    }

	async clickSubmitToContractManagement(): Promise<void> {
		await this.playwright.waitForPageLoad();
		const submitContractFrame = this.page.frameLocator("xpath=(//iframe[contains(@name,'vfFrameId')])[last()]");
		await submitContractFrame.locator('body').waitFor({ state: 'visible' });
		await this.playwright.waitForPageLoad();
      	await this.playwright.click(submitContractFrame.locator("xpath=//a[normalize-space(.)='Submit to Contract Management']").filter({ visible: true }).first());
    	await this.page.waitForLoadState('domcontentloaded');
    			await this.playwright.waitForPageLoad();
	}

	
	async clickSubmitToContractManagementButton(): Promise<void> {
		//await this.page.waitForTimeout(10000);
      	await this.playwright.click(this.page.locator("xpath=//*[self::a or self::button][normalize-space(.)='Submit to Contract Management']").filter({ visible: true }).first());
    	await this.playwright.waitForPageLoad();
	}
	

	
}
