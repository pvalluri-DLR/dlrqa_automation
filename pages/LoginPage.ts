import { Page } from '@playwright/test';
import { PlaywrightUtil } from '../utils/PlaywrightUtil';

export class LoginPage {
	private readonly playwright: PlaywrightUtil;

	constructor(private page: Page) {
		this.playwright = new PlaywrightUtil(page);
	}

	async navigate(url: string): Promise<void> {
		await this.playwright.navigate(url);
	}

	async loginToSalesforce(username: string, password: string): Promise<void> {
		try {
			await this.playwright.fill('#username', username);
			await this.playwright.click('#Login');
			await this.playwright.waitForTimeout(2000);
			await this.playwright.fill('#password', password);
			await this.playwright.click('#Login');
			await this.playwright.fill('#tc',"RPEQNMIEKX");
			await this.playwright.click('#save');
			await this.playwright.waitForTimeout(10000);
			
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`Salesforce login failed: ${message}`);
			throw error;
		}
	}

	async login(username: string, password: string): Promise<void> {
		await this.loginToSalesforce(username, password);
	}
}