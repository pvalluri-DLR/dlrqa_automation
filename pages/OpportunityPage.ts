import { FrameLocator, Page, expect } from '@playwright/test';
import { PlaywrightUtil } from '../utils/PlaywrightUtil';
import { recordStepDetail } from '../utils/StepReportUtil';

export interface OpportunityValues {
	accountName?: string;
	transactionType?: string;
	transactionSubtype?: string;
	cAndAOpportunity?: string;
	opportunityIdentifier?: string;
	serviceFabric?: string;
	annualizedGaap?: string;
	initialContact?: string;
	primaryUseCase?: string;
	proposedMarket?: string;
	currency?: string;
}

export class OpportunityPage {
	private readonly playwright: PlaywrightUtil;

	constructor(private readonly page: Page) {
		this.playwright = new PlaywrightUtil(page);
	}

	async enterOpportunityValues(values: OpportunityValues): Promise<void> {
		//if (values.accountName) await this.typeAndSelectLookup('Account Name', values.accountName);
		if (values.transactionType) await this.selectTransactionType(values.transactionType);
		if (values.cAndAOpportunity) await this.selectCAndAOpportunity(values.cAndAOpportunity);
		if (values.opportunityIdentifier) await this.playwright.fill(this.page.getByLabel('Opportunity identifier', { exact: true }).filter({ visible: true }).first(), values.opportunityIdentifier);
		if (values.serviceFabric) await this.selectServiceFabric(values.serviceFabric);
		if (values.annualizedGaap) await this.playwright.fill(this.page.locator("xpath=//input[@name='Annualized_GAAP__c']").filter({ visible: true }).first(), values.annualizedGaap);
		if (values.initialContact) await this.selectInitialContact(values.initialContact);
		if (values.primaryUseCase) await this.selectPrimaryUseCase(values.primaryUseCase);
		if (values.proposedMarket) await this.selectProposedMarket(values.proposedMarket);
		await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(20000);
		await this.playwright.click(this.page.locator("xpath=//button[normalize-space(.)='Save']").filter({ visible: true }).first());
		await this.playwright.waitForTimeout(20000);
	}

	async searchAndSelectAccount(accountName: string): Promise<void> {
		await this.playwright.waitForPageLoad();
		await this.playwright.click(this.page.locator("xpath=//div[@class='slds-global-header__item slds-global-header__item_search']//button").filter({ visible: true }).first());
		await this.page.keyboard.type(accountName, { delay: 100 });
		await this.playwright.waitForPageLoad();
		await this.playwright.click(this.page.getByRole('option').filter({ has: this.page.getByText(accountName, { exact: true }) }).filter({ visible: true }).first());
		await this.playwright.waitForPageLoad();
	}

	async selectProperty(propertyName: string): Promise<void> {
		await this.playwright.click(this.page.getByRole('button', { name: 'Edit Property' }).filter({ visible: true }).first());
		await this.playwright.typeCharacterByCharacter(this.page.getByLabel(/^Property/).filter({ visible: true }).first(), propertyName);
		//await this.playwright.click(this.page.getByRole('option').filter({ hasText: propertyName }).filter({ visible: true }).first());
		await this.playwright.waitForPageLoad();
		await this.playwright.click(this.page.locator("xpath=(//*[normalize-space(.)='Search Results']/following::*[self::a or @role='option'])[1]").filter({ visible: true }).first());
		await this.playwright.click(this.page.locator("xpath=//button[@name='SaveEdit']").filter({ visible: true }).first());
		await this.playwright.waitForPageLoad();
	}

	async PropertyForDFW35(): Promise<void> {
		await this.playwright.click(this.page.getByRole('button', { name: 'Edit Property' }).filter({ visible: true }).first());
		await this.playwright.typeCharacterByCharacter(this.page.getByLabel(/^Property/).filter({ visible: true }).first(), 'DFW35');
		await this.playwright.waitForPageLoad();
		await this.playwright.click(this.page.locator("xpath=//lightning-base-combobox-item//lightning-base-combobox-formatted-text[contains(@title,'DFW35')]").filter({ visible: true }).first());
	}

	async selectInitialContact(value: string): Promise<void> {
		const initialContactInput = this.page.locator("xpath=//input[@aria-label='Initial Contact']").filter({ visible: true }).first();
		await this.playwright.typeCharacterByCharacter(initialContactInput, value);
		await this.playwright.click(this.page.locator("xpath=(//*[normalize-space(.)='Search Results']/following::*[self::a or @role='option'])[1]").filter({ visible: true }).first());
		// await this.playwright.click(this.page.locator(`xpath=//span[contains(@title,'Contact ${value}')]`).filter({ visible: true }).first());
	}

	async selectProposedMarket(value: string): Promise<void> {
		const proposedMarketInput = this.page.locator("xpath=//input[@aria-label='Proposed Market']").filter({ visible: true }).first();
		await this.playwright.typeCharacterByCharacter(proposedMarketInput, value);
		await this.playwright.waitForPageLoad();
		//await this.playwright.click(this.page.locator(`xpath=//span[contains(@title,'${value}')]`).filter({ visible: true }).first());
		await this.playwright.click(this.page.locator(`xpath=//lightning-base-combobox-item//lightning-base-combobox-formatted-text[@title='${value}']`).filter({ visible: true }).first());
		
	}

	private async typeAndSelectLookup(label: string, value: string): Promise<void> {
		await this.playwright.typeCharacterByCharacter(this.page.getByLabel(label, { exact: true }).filter({ visible: true }).first(), value);
		await this.playwright.click(this.page.getByRole('option').filter({ hasText: value }).filter({ visible: true }).first());
	}

	async selectTransactionType(transactionType: string): Promise<void> {
        const transactionTypeCombobox = this.page.locator("xpath=//label[text()='Transaction Type']/../..//lightning-base-combobox").filter({ visible: true }).first();
        await this.playwright.selectFromDropdown(transactionTypeCombobox, this.page.locator(`xpath=//lightning-base-combobox-item[@data-value='${transactionType}']`).filter({ visible: true }).first(), transactionType);
    }

	async selectCAndAOpportunity(value: string): Promise<void> {
        const cAndACombobox = this.page.locator("xpath=//label[text()='C&A Opportunity']/../..//lightning-base-combobox").filter({ visible: true }).first();
        await this.playwright.selectFromDropdown(cAndACombobox, this.page.locator(`xpath=//lightning-base-combobox-item[@data-value='${value}']`).filter({ visible: true }).first(), value);
    }

	async selectServiceFabric(value: string): Promise<void> {
        const serviceFabricCombobox = this.page.locator("xpath=//label[text()='ServiceFabric™']/../..//lightning-base-combobox").filter({ visible: true }).first();
        await this.playwright.selectFromDropdown(serviceFabricCombobox, this.page.locator(`xpath=//lightning-base-combobox-item[@data-value='${value}']`).filter({ visible: true }).first(), value);
    }

	async selectPrimaryUseCase(value: string): Promise<void> {
        const primaryUseCaseCombobox = this.page.locator("xpath=//label[text()='Primary Use Case']/../..//lightning-base-combobox").filter({ visible: true }).first();
        await this.playwright.selectFromDropdown(primaryUseCaseCombobox, this.page.locator(`xpath=//lightning-base-combobox-item[@data-value='${value}']`).filter({ visible: true }).first(), value);
    }

	async selectRegion(value: string): Promise<void> {
		const regionCombobox = this.page.locator("xpath=//label[text()='Region']/../..//lightning-base-combobox").filter({ visible: true }).first();
		await this.playwright.selectFromDropdown(regionCombobox, this.page.locator(`xpath=//lightning-base-combobox-item[@data-value='${value}']`).filter({ visible: true }).first(), value);
	}

	private async selectDropdownOption(label: string, value: string): Promise<void> {
		await this.playwright.selectFromDropdown(
			this.page.getByRole('combobox', { name: label, exact: true }).filter({ visible: true }).first(),
			this.page.getByRole('option', { name: value, exact: true }).filter({ visible: true }).first(),
			value,
		);
	}

    async clickNewOpportunity(): Promise<void> {
		await this.playwright.waitForTimeout(30000);
		await this.playwright.waitForPageLoad();
        const opportunities = this.page.locator('article').filter({
            has: this.page.getByText(/^Opportunities(?:\s*\(\d+\))?$/),
        });
        await this.playwright.click(opportunities.locator('.slds-card__header').getByRole('button'));
        await this.playwright.click(this.page.getByRole('menuitem', { name: 'New', exact: true }));
        await this.playwright.click(this.page.locator("xpath=//button[normalize-space(.)='Next']").filter({ visible: true }).first());
		await this.playwright.waitForPageLoad();
    }

	async changeOpportunityOwner(ownerName: string): Promise<void> {
		await this.playwright.waitForTimeout(10000);
		await this.playwright.waitForPageLoad();
        const maxAttempts = 3;
        const suggestionTimeoutMs = 3000;
        const searchInput = this.page.locator("xpath=//input[@title='Search Users']").filter({ visible: true }).first();
        const suggestion = this.page.locator(`xpath=//div[@title='${ownerName}']`).filter({ visible: true }).first();

        await this.playwright.click(this.page.getByRole('button', { name: /^(Change Owner|Change Opportunity Owner)$/i }));
		await this.playwright.waitForPageLoad();
        //const dialog = this.page.getByRole('dialog', { name: 'Change Opportunity Owner', exact: true });
        let suggestionDisplayed = false;
        for (let attempt = 1; attempt <= maxAttempts && !suggestionDisplayed; attempt++) {
            if (attempt > 1) {
                await searchInput.clear();
            }
            await this.playwright.typeCharacterByCharacter(searchInput, ownerName, 30);
            suggestionDisplayed = await suggestion
                .waitFor({ state: 'visible', timeout: suggestionTimeoutMs })
                .then(() => true)
                .catch(() => false);
        }
        if (!suggestionDisplayed) {
            throw new Error(`Suggestion for owner "${ownerName}" was not displayed after ${maxAttempts} attempts`);
        }
        await this.playwright.click(suggestion);
        await this.playwright.click(this.page.getByRole('button', { name: 'Change Owner', exact: true }).filter({ visible: true }).first());
        //await expect(this.page.getByRole('button', { name: 'Change Owner', exact: true }).filter({ visible: true }).first()).toBeHidden({ timeout: 30000 });
        await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(10000);
	}

	private async switchToCanvasInnerFrame(): Promise<FrameLocator> {
        await this.playwright.waitForTimeout(40000);
        const outerFrameId = 'canvas-outer-_:Oracle_Adapter:embeddedTransactionCanvas';
        const innerFrameId = 'canvas-inner-_:Oracle_Adapter:embeddedTransactionCanvas';
        const cpqMainFrameXpath = "xpath=(//*[@title='accessibility title'])[last()]";
        const cpqMainFrameExists = await this.page.locator(cpqMainFrameXpath)
            .waitFor({ state: 'attached', timeout: 15000 })
            .then(() => true)
            .catch(() => false);
        let root: Page | FrameLocator = this.page;
        if (cpqMainFrameExists) {
            root = this.page.frameLocator(cpqMainFrameXpath);
        }
        const outerFrame = root.frameLocator(`iframe[name="${outerFrameId}"]`);
        return outerFrame.frameLocator(`iframe[name="${innerFrameId}"]`);
    }

	async clickReturnToOpportunity(): Promise<void> {
		await this.playwright.waitForTimeout(40000);
        await this.playwright.waitForPageLoad();
        const innerFrame = await this.switchToCanvasInnerFrame();
        const returnToOpportunityButton = innerFrame
            .locator("xpath=//span[text()='Return to Opportunity']")
            .filter({ visible: true })
            .first();
        await returnToOpportunityButton.waitFor({ state: 'visible', timeout: 60000 });
        await this.playwright.click(returnToOpportunityButton);
    }

	// async clickNewDeployment(): Promise<void> {
    //     await this.playwright.waitForPageLoad();
    //     const innerFrame = await this.switchToCanvasInnerFrame();
    //     const newDeploymentButton = innerFrame
    //         .locator("xpath=//span[text()='New Deployment']")
    //         .filter({ visible: true })
    //         .first();
    //     await newDeploymentButton.waitFor({ state: 'visible', timeout: 60000 });
    //     await this.playwright.click(newDeploymentButton);
    // }

	async verifyQuoteGenerated(): Promise<string> {
		await this.playwright.waitForTimeout(40000);
        await this.playwright.waitForPageLoad();
        const quoteLink = this.page.locator("xpath=//a[starts-with(normalize-space(.),'CPQ-')]").filter({ visible: true }).first();
        await this.playwright.waitForVisible(quoteLink, 60000);
        const quoteNumber = (await quoteLink.innerText()).match(/CPQ-\d+/)?.[0];
        if (!quoteNumber) {
            throw new Error('Quote number (CPQ-xxxxx) was not found in the Oracle Quotes related list');
        }
		
        recordStepDetail(this.page, 'Quote Number', quoteNumber);
        return quoteNumber;
    }

	async clickNewOracleQuote(): Promise<void> {
        	await this.playwright.waitForTimeout(40000);
        await this.playwright.waitForPageLoad();
        await this.playwright.click(this.page.locator("xpath=//*[*[contains(@class, 'firstHeaderRow')]//a[*[text()='Oracle Quotes']]]//button[@aria-expanded='false']").filter({ visible: true }).first());
        //await this.playwright.waitForPageLoad();
        await this.playwright.waitForTimeout(40000);
		await this.playwright.click(this.page.locator("xpath=(//a[*[text()='New Oracle Quote']])[last()]").filter({ visible: true }).first());
		//await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(40000);
        // const oracleQuotesHeader = this.page.locator('.slds-card__header-title').filter({
        //     has: this.page.getByText(/^Oracle Quotes(?:\s*\(\d+\))?$/),
        // });
        // await this.playwright.click(oracleQuotesHeader.getByRole('button'));
        // await this.playwright.click(this.page.locator("xpath=//a[normalize-space(.)='New Oracle Quote']").filter({ visible: true }).first());
    }

	async clickEditOracleQuote(quoteNumber: string): Promise<void> {
        await this.playwright.waitForPageLoad();
        await this.playwright.click(this.page.locator(`xpath=//article[contains(@aria-label,'${quoteNumber}')]//button[@aria-expanded='false']`).filter({ visible: true }).first());
        await this.playwright.click(this.page.locator("xpath=//a[@title='Edit' or normalize-space(.)='Edit']").filter({ visible: true }).first());
        await this.playwright.waitForPageLoad();
    }

	// async selectSuite(suite: string): Promise<void> {
    //     await this.playwright.waitForTimeout(20000);
    //      const innerFrame = await this.switchToCanvasInnerFrame();
    //     await this.playwright.waitForPageLoad();
    //     const suiteSelectionInput = innerFrame.locator("xpath=//input[@type='text' and contains(@id, 'suite_selector')]").filter({ visible: true }).first();
    //     const suiteOption = innerFrame.locator(`xpath=//*[@id='oj-listbox-results-suite_selector_pF-combobox']/li[*[@aria-label='${suite}']]`).filter({ visible: true }).first();
    //     await suiteSelectionInput.waitFor({ state: 'visible', timeout: 60000 });
    //     await this.playwright.click(suiteSelectionInput);
    //     await suiteSelectionInput.fill(suite);
    //     await suiteOption.waitFor({ state: 'visible', timeout: 30000 });
    //     await this.playwright.click(suiteOption);
    //     await this.playwright.waitForPageLoad();
    //     await this.playwright.waitForTimeout(20000);
    // }

	async verifyDraftQuoteAndGetCpqNumber(): Promise<string> {
        const status = this.page.getByLabel('Quote Status', { exact: true });
        await expect(status.getByRole('option', { name: 'Draft', exact: true, selected: true, includeHidden: true })).toBeAttached();
 
        const quoteNumberPattern = /\bCPQ-\d+\b/;
        const quoteNumber = this.page.getByText(quoteNumberPattern).filter({ visible: true }).first();
        await expect(quoteNumber).toBeVisible();
        const match = (await quoteNumber.innerText()).match(quoteNumberPattern);
        if (!match) {
            throw new Error('The quote number was not found on the quote page');
        }
        return match[0];
    }
}

