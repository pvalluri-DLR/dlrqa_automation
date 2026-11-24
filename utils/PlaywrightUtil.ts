import type { Locator, Page } from '@playwright/test';
import { runStepAction } from './StepReportUtil';

const MAX_HARD_WAIT_MS = 5000;

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

	async typeCharacterByCharacter(selector: string | Locator, value: string, delay = 1000): Promise<void> {
		const field = this.describeField(selector);
		await runStepAction(this.page, `Entered value - "${this.displayValue(field, value)}" in the "${field}"`, async () => {
			await this.getLocator(selector).pressSequentially(value, { delay });
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
			await this.waitForPageLoad();
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

	async waitForVisible(selector: string | Locator, timeout?: number): Promise<void> {
		await runStepAction(this.page, `Wait for "${this.describeField(selector)}" to be visible`, async () => {
			await this.getLocator(selector).waitFor({ state: 'visible', timeout });
		});
	}

	async waitForPageLoad(): Promise<void> {
		await runStepAction(this.page, 'Wait for page to load', async () => {
			const checkIntervalMs = 1000;
			const maxChecks = 60;
			for (let check = 1; check <= maxChecks; check++) {
				// Navigations destroy the execution context mid-poll; treat that as "not ready yet" instead of failing.
				const isReady = await this.page
					.evaluate(() => document.readyState === 'complete')
					.catch(() => false);
				const spinnersVisible = await this.page
					.locator('.slds-spinner_container')
					.filter({ visible: true })
					.count()
					.catch(() => 1);
				const logoVisible = await this.page
					.locator('.slds-global-header__logo, .slds-icon-waffle_container')
					.filter({ visible: true })
					.count()
					.catch(() => 0);
				if (isReady && spinnersVisible === 0 && logoVisible > 0) {
					return;
				}
				if (check < maxChecks) {
					await this.page.waitForLoadState('domcontentloaded', { timeout: checkIntervalMs }).catch(() => undefined);
					// Plain timer keeps the 60s budget even if the page has closed.
					await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
				}
			}
			throw new Error('Page did not finish loading within 60 seconds');
		});
	}

	async waitForTabsToLoad(tabNames: string[], timeout = 60000): Promise<void> {
		await runStepAction(this.page, `Wait for tabs to load: ${tabNames.join(', ')}`, async () => {
			for (const tabName of tabNames) {
				await this.page
					.getByRole('tab', { name: tabName, exact: true })
					.filter({ visible: true })
					.first()
					.waitFor({ state: 'visible', timeout });
			}
		});
	}

	async waitForTimeout(milliseconds: number): Promise<void> {
		// Hard waits are capped so accumulated fixed waits cannot exhaust the test timeout.
		const cappedMs = Math.min(milliseconds, MAX_HARD_WAIT_MS);
		await runStepAction(this.page, `Wait ${cappedMs} ms`, async () => {
			await this.page.waitForTimeout(cappedMs).catch(() => {
				console.warn(`Skipped fixed wait of ${cappedMs} ms due to an error`);
			});
		});
	}
}
