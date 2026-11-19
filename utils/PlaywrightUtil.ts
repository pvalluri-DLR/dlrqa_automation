import type { Locator, Page } from '@playwright/test';
import { runStepAction } from './StepReportUtil';

export class PlaywrightUtil {
	constructor(private readonly page: Page) {}

	private describeField(target: string | Locator): string {
		if (typeof target === 'string') {
			return target;
		}
		const description = target.toString();
		const match = description.match(/name: '([^']*)'/) ?? description.match(/getBy(?:Label|Text|Placeholder)\('([^']*)'/);
		return match ? match[1] : description;
	}

	private displayValue(field: string, value: string): string {
		return /password/i.test(field) ? '********' : value;
	}

	private getLocator(selector: string | Locator): Locator {
		return typeof selector === 'string' ? this.page.locator(selector) : selector;
	}

	async navigate(url: string): Promise<void> {
		await runStepAction(this.page, 'Navigate to URL', async () => {
			await this.page.goto(url);
		});
	}

	async click(selector: string | Locator): Promise<void> {
		await runStepAction(this.page, `Clicked on "${this.describeField(selector)}"`, async () => {
			await this.getLocator(selector).click();
		});
	}

	async fill(selector: string | Locator, value: string): Promise<void> {
		const field = this.describeField(selector);
		await runStepAction(this.page, `Entered value - "${this.displayValue(field, value)}" in the "${field}"`, async () => {
			await this.getLocator(selector).fill(value);
		});
	}

	async typeCharacterByCharacter(selector: string | Locator, value: string): Promise<void> {
		const field = this.describeField(selector);
		await runStepAction(this.page, `Entered value - "${this.displayValue(field, value)}" in the "${field}"`, async () => {
			await this.getLocator(selector).pressSequentially(value);
		});
	}

	async press(selector: string | Locator, key: string): Promise<void> {
		await runStepAction(this.page, `Press ${key} in "${this.describeField(selector)}"`, async () => {
			await this.getLocator(selector).press(key);
		});
	}

	async selectOption(selector: string | Locator, value: string): Promise<void> {
		const field = this.describeField(selector);
		await runStepAction(this.page, `Selected value - "${value}" from the dropdown "${field}"`, async () => {
			await this.getLocator(selector).selectOption(value);
		});
	}

	async selectFromDropdown(dropdown: string | Locator, option: string | Locator, value: string): Promise<void> {
		const field = this.describeField(dropdown);
		await runStepAction(this.page, `Selected value - "${value}" from the dropdown "${field}"`, async () => {
			await this.getLocator(dropdown).click();
			await this.getLocator(option).click();
		});
	}

	async check(selector: string | Locator): Promise<void> {
		await runStepAction(this.page, `Checked "${this.describeField(selector)}"`, async () => {
			await this.getLocator(selector).check();
		});
	}

	async uncheck(selector: string | Locator): Promise<void> {
		await runStepAction(this.page, `Unchecked "${this.describeField(selector)}"`, async () => {
			await this.getLocator(selector).uncheck();
		});
	}

	async waitForVisible(selector: string | Locator): Promise<void> {
		await runStepAction(this.page, `Wait for "${this.describeField(selector)}" to be visible`, async () => {
			await this.getLocator(selector).waitFor({ state: 'visible' });
		});
	}

	async waitForPageLoad(): Promise<void> {
		await runStepAction(this.page, 'Wait for page to load', async () => {
			await this.page.waitForLoadState('load');
		});
	}

	async waitForTimeout(milliseconds: number): Promise<void> {
		await runStepAction(this.page, `Wait ${milliseconds} ms`, async () => {
			await this.page.waitForTimeout(milliseconds);
		});
	}
}
