import type { Page, TestInfo } from '@playwright/test';

interface StepAttachment {
	stepName: string;
	timestamp: string;
	status: string;
	duration: number;
	applicationUrl: string;
	actions: StepActionAttachment[];
	error?: string;
	screenshot?: string;
}

export interface StepActionAttachment {
	action: string;
	timestamp: string;
	status: string;
	error?: string;
}

const actionLogsByPage = new WeakMap<Page, StepActionAttachment[]>();

export async function runStepAction(page: Page, action: string, execute: () => Promise<void>): Promise<void> {
	const actionLog: StepActionAttachment = {
		action,
		timestamp: new Date().toISOString(),
		status: 'passed',
	};
	try {
		await execute();
	} catch (caughtError) {
		actionLog.status = 'failed';
		actionLog.error = caughtError instanceof Error ? caughtError.message : String(caughtError);
		throw caughtError;
	} finally {
		actionLogsByPage.get(page)?.push(actionLog);
	}
}

export async function runStep(
	page: Page,
	testInfo: TestInfo,
	stepName: string,
	action: () => Promise<void>,
): Promise<void> {
	const startedAt = Date.now();
	const timestamp = new Date(startedAt).toISOString();
	const actions: StepActionAttachment[] = [];
	actionLogsByPage.set(page, actions);
	let status = 'passed';
	let error: string | undefined;

	try {
		await action();
	} catch (caughtError) {
		status = 'failed';
		error = caughtError instanceof Error ? caughtError.message : String(caughtError);
		console.error([
			'',
			'========== TEST STEP FAILED ==========',
			`Test: ${testInfo.titlePath.join(' > ')}`,
			`Step: ${stepName}`,
			`File: ${testInfo.file}`,
			`Error: ${error}`,
			'======================================',
		].join('\n'));
		throw caughtError;
	} finally {
		let screenshot: Buffer | undefined;
		let screenshotError: string | undefined;
		if (!page.isClosed()) {
			try {
				screenshot = await page.screenshot({ fullPage: false });
			} catch (caughtError) {
				screenshotError = caughtError instanceof Error ? caughtError.message : String(caughtError);
			}
		}
		const applicationUrl = page.isClosed() ? '' : page.url();
		const duration = Date.now() - startedAt;
		if (screenshot) {
			await testInfo.attach(`${stepName} screenshot`, {
				body: screenshot,
				contentType: 'image/png',
			});
		}
		const log = [
			`Step: ${stepName}`,
			`Timestamp: ${timestamp}`,
			`Status: ${status}`,
			`Duration: ${duration} ms`,
			`Application URL: ${applicationUrl || 'Unavailable'}`,
			...(screenshotError ? [`Screenshot unavailable: ${screenshotError}`] : []),
			...(error ? [`Error: ${error}`] : []),
		].join('\n');
		await testInfo.attach(`${stepName} log`, {
			body: log,
			contentType: 'text/plain',
		});
		const attachment: StepAttachment = {
			stepName,
			timestamp,
			status,
			duration,
			applicationUrl,
			actions,
			error,
			screenshot: screenshot?.toString('base64'),
		};
		await testInfo.attach(`word-report-step-${startedAt}`, {
			body: JSON.stringify(attachment),
			contentType: 'application/json',
		});
		actionLogsByPage.delete(page);
	}
}