import { expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { runStepAction } from './StepReportUtil';

/**
 * 'always'    - capture a screenshot after every validation.
 * 'onFailure' - capture a screenshot only when the validation fails (default).
 * 'never'     - never capture a screenshot.
 */
export type ScreenshotPolicy = 'always' | 'onFailure' | 'never';

export interface ValidationOptions {
	screenshot?: ScreenshotPolicy;
	/** Highlights the validated element in the application before capturing. Default: true. */
	highlight?: boolean;
	/** Assertion timeout in milliseconds. */
	timeout?: number;
	/** Custom label used in the step report. */
	description?: string;
}

const ORIGINAL_STYLE_ATTRIBUTE = 'data-validation-original-style';

export class ValidationUtil {
	constructor(
		private readonly page: Page,
		private readonly testInfo: TestInfo,
	) {}

	async verifyTextEquals(target: string | Locator, expected: string, options: ValidationOptions = {}): Promise<void> {
		const locator = this.getLocator(target);
		const label = this.describe(target, options.description);
		await this.runValidation(`Verified text equals "${expected}" in "${label}"`, locator, options, async () => {
			await expect(locator).toHaveText(expected, { timeout: options.timeout });
		});
	}

	async verifyTextContains(target: string | Locator, expected: string, options: ValidationOptions = {}): Promise<void> {
		const locator = this.getLocator(target);
		const label = this.describe(target, options.description);
		await this.runValidation(`Verified text contains "${expected}" in "${label}"`, locator, options, async () => {
			await expect(locator).toContainText(expected, { timeout: options.timeout });
		});
	}

	async verifyValueEquals(target: string | Locator, expected: string, options: ValidationOptions = {}): Promise<void> {
		const locator = this.getLocator(target);
		const label = this.describe(target, options.description);
		await this.runValidation(`Verified value equals "${expected}" in "${label}"`, locator, options, async () => {
			await expect(locator).toHaveValue(expected, { timeout: options.timeout });
		});
	}

	async verifyElementPresent(target: string | Locator, options: ValidationOptions = {}): Promise<void> {
		const locator = this.getLocator(target);
		const label = this.describe(target, options.description);
		await this.runValidation(`Verified element is present: "${label}"`, locator, options, async () => {
			await expect(locator.first()).toBeAttached({ timeout: options.timeout });
		});
	}

	async verifyElementNotPresent(target: string | Locator, options: ValidationOptions = {}): Promise<void> {
		const locator = this.getLocator(target);
		const label = this.describe(target, options.description);
		await this.runValidation(`Verified element is not present: "${label}"`, locator, options, async () => {
			await expect(locator).toHaveCount(0, { timeout: options.timeout });
		});
	}

	private async runValidation(
		action: string,
		locator: Locator,
		options: ValidationOptions,
		assertion: () => Promise<void>,
	): Promise<void> {
		const policy = options.screenshot ?? 'onFailure';
		const highlight = options.highlight ?? true;

		await runStepAction(this.page, action, async () => {
			let failed = false;
			let failure: unknown;
			try {
				await assertion();
			} catch (caughtError) {
				failed = true;
				failure = caughtError;
			}

			if (policy === 'always' || (policy === 'onFailure' && failed)) {
				await this.captureScreenshot(locator, action, highlight);
			}
			if (failed) {
				throw failure;
			}
		});
	}

	private async captureScreenshot(locator: Locator, name: string, highlight: boolean): Promise<void> {
		const restore = highlight ? await this.highlight(locator) : async () => {};
		try {
			const body = await this.page.screenshot({ fullPage: false });
			await this.testInfo.attach(`${name} screenshot`, { body, contentType: 'image/png' });
		} catch (caughtError) {
			console.error(`Validation screenshot unavailable for "${name}": ${String(caughtError)}`);
		} finally {
			await restore();
		}
	}

	/** Returns a function that restores the element's original inline style. */
	private async highlight(locator: Locator): Promise<() => Promise<void>> {
		const target = locator.first();
		if ((await target.count()) === 0) {
			return async () => {};
		}
		await target.evaluate((element: HTMLElement, attribute: string) => {
			element.setAttribute(attribute, element.getAttribute('style') ?? '');
			element.scrollIntoView({ block: 'center', inline: 'center' });
			element.style.outline = '4px solid red';
			element.style.outlineOffset = '2px';
			element.style.backgroundColor = 'yellow';
		}, ORIGINAL_STYLE_ATTRIBUTE);

		return async () => {
			await target
				.evaluate((element: HTMLElement, attribute: string) => {
					const original = element.getAttribute(attribute);
					if (original === null) {
						return;
					}
					if (original) {
						element.setAttribute('style', original);
					} else {
						element.removeAttribute('style');
					}
					element.removeAttribute(attribute);
				}, ORIGINAL_STYLE_ATTRIBUTE)
				.catch(() => undefined);
		};
	}

	private getLocator(target: string | Locator): Locator {
		return typeof target === 'string' ? this.page.locator(target) : target;
	}

	private describe(target: string | Locator, description?: string): string {
		if (description) {
			return description;
		}
		return typeof target === 'string' ? target : target.toString();
	}
}
