import { defineConfig } from '@playwright/test';
export default defineConfig({
	testMatch: ['**/*.@(spec|test).?(c|m)[jt]s?(x)', '**/*Test.ts', '**/AccountCreation.ts'],
	timeout: 3 * 60 * 60 * 1000,
	fullyParallel: true,
	workers: 2,
	reporter: [['list'], ['./utils/WordReportReporter.ts'], ['html', { open: 'never' }]],
	use: {
		headless: false,
		viewport: null,
		launchOptions: { args: ['--start-maximized'] },
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
		video: 'on',
	},
});