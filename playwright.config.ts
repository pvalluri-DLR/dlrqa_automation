import { defineConfig } from '@playwright/test';
export default defineConfig({
	testMatch: ['**/*.@(spec|test).?(c|m)[jt]s?(x)', '**/*Test.ts', '**/AccountCreation.ts'],
	fullyParallel: true,
	workers: 2,
	reporter: [['list'], ['./utils/WordReportReporter.ts']],
	use: {
		headless: false,
		viewport: null,
		launchOptions: { args: ['--start-maximized'] },
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
	},
});