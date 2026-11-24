import { Page } from '@playwright/test';
import { PlaywrightUtil } from '../utils/PlaywrightUtil';

export interface LeadValues {
	leadSource?: string;
	leadSourceDetail?: string;
	leadStatus?: string;
	email?: string;
	country?: string;
	regionOfInterest?: string;
	metro?: string;
	companyHqCountry?: string;
	salutation?: string;
	firstName?: string;
	lastName?: string;
	company?: string;
	leadCurrency?: string;
	street?: string;
	city?: string;
	stateProvince?: string;
	zipPostalCode?: string;
}

export class LeadsCreationPage {
	private readonly playwright: PlaywrightUtil;

	constructor(private readonly page: Page) {
		this.playwright = new PlaywrightUtil(page);
	}

	async leadsCreation(values: LeadValues): Promise<void> {
		if (values.salutation) await this.selectDropdown('Salutation', values.salutation);
		if (values.firstName) await this.fillField('First Name', values.firstName);
		if (values.lastName) await this.fillField('Last Name', values.lastName);
		if (values.company) await this.fillField('Company', values.company);
		if (values.leadSource) await this.selectDropdown('Lead Source', values.leadSource);
		if (values.leadSourceDetail) await this.selectDropdown('Lead Source Detail', values.leadSourceDetail);
		if (values.leadStatus) await this.selectDropdown('Lead Status', values.leadStatus);
		if (values.email) await this.fillField('Email', values.email);
		if (values.leadCurrency) await this.selectDropdown('Lead Currency', values.leadCurrency);
		if (values.country) await this.fillField('Country', values.country);
		if (values.regionOfInterest) await this.selectDropdown('Region of Interest', values.regionOfInterest);
		if (values.metro) await this.fillField('Metro', values.metro);
		if (values.companyHqCountry) await this.selectDropdown('Company HQ Country', values.companyHqCountry);
		if (values.street) await this.fillField('Street', values.street);
		if (values.city) await this.fillField('City', values.city);
		if (values.stateProvince) await this.fillField('State/Province', values.stateProvince);
		if (values.zipPostalCode) await this.fillField('Zip/Postal Code', values.zipPostalCode);
		await this.playwright.click(this.page.locator("xpath=//button[normalize-space(.)='Save']").filter({ visible: true }).first());
	}

	private async fillField(label: string, value: string): Promise<void> {
		const input = this.page.getByLabel(label, { exact: true }).filter({ visible: true }).first();
		await this.playwright.fill(input, value);
	}

	private async selectDropdown(label: string, value: string): Promise<void> {
		const combobox = this.page
			.locator(`xpath=//label[text()='${label}']/../..//lightning-base-combobox`)
			.filter({ visible: true })
			.first();
		const option = this.page
			.locator(`xpath=//lightning-base-combobox-item//lightning-base-combobox-formatted-text[@title='${value}']`)
			.filter({ visible: true })
			.first();
		await this.playwright.selectFromDropdown(combobox, option, value);
	}
}
