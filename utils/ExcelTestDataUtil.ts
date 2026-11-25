import { Workbook, Worksheet } from 'exceljs';
import * as fs from 'fs/promises';
import * as path from 'path';

const properties = require('properties') as {
	parse: (input: string) => Record<string, string>;
};

export interface SalesforceTestData {
	testName: string;
	applicationUrl: string;
	username: string;
	password: string;
	website?: string;
	salesAccountName: string;
	country: string;
	salesRecordType: string;
	leadSource: string;
	newAccountReason: string;
	leadSourceDetail: string;
	billingRegion: string;
	billingCountry: string;
	billingState: string;
	billingCity: string;
	billingPostalCode: string;
	billingStreet: string;
	legalEntityName: string;
	legalEntityRecordType: string;
	opportunityCurrency: string;
	contactFirstName: string;
	contactLastName: string;
	contactEmail: string;
	contactPhone: string;
	suite: string;
	transactionType?: string;
	cAndAOpportunity?: string;
	serviceFabric?: string;
	annualizedGaap?: string;
	primaryUseCase?: string;
	proposedMarket?: string;
}

const requiredColumns = [
	'testname',
	'salesaccountname',
	'salesrecordtype',
	'country',
	'leadsource',
	'newaccountreason',
	'leadsourcedetail',
	'billingregion',
	'billingcountry',
	'billingstate',
	'billingcity',
	'billingpostalcode',
	'billingstreet',
	'legalentityname',
	'legalentityrecordtype',
	'opportunitycurrency',
	'contactfirstname',
	'contactlastname',
	'contactemail',
	'contactphone',
];

export interface TestDataSource {
	workbookFile: string;
	sheetName: string;
}

export interface SpaceProductConfigurationData {
	productName1: string;
	productName2: string;
	numberOfCageCabinets: string;
}

export async function readdataBySheetname(source: TestDataSource): Promise<SpaceProductConfigurationData> {
	const { workbookPath, worksheet } = await loadWorksheet(source);

	const columns = new Map<string, number>();
	worksheet.getRow(1).eachCell((cell, columnNumber) => {
		columns.set(cell.text.trim().toLowerCase(), columnNumber);
	});

	const row = worksheet.getRow(2);
	const getExcelValue = (column: string): string => {
		const columnNumber = columns.get(column);
		if (!columnNumber) {
			throw new Error(`Worksheet "${source.sheetName}" in ${workbookPath} must include column: ${column}`);
		}
		return row.getCell(columnNumber).text.trim();
	};

	return {
		productName1: getExcelValue('productname_1'),
		productName2: getExcelValue('productname_2'),
		numberOfCageCabinets: getExcelValue('cagenumberofcabinets'),
	};
}

async function loadWorksheet(source: TestDataSource): Promise<{ workbookPath: string; worksheet: Worksheet }> {
	const workbookPath = path.resolve(process.cwd(), source.workbookFile);
	const workbook = new Workbook();
	await workbook.xlsx.readFile(workbookPath);

	const worksheet = workbook.getWorksheet(source.sheetName);
	if (!worksheet) {
		throw new Error(`Worksheet "${source.sheetName}" not found in test data workbook: ${workbookPath}`);
	}
	return { workbookPath, worksheet };
}

export async function findTestDataSource(testName: string): Promise<TestDataSource | undefined> {
	const dataDir = path.resolve(process.cwd(), 'test-data');
	const fileNames = (await fs.readdir(dataDir)).filter((fileName) => fileName.toLowerCase().endsWith('.xlsx'));

	for (const fileName of fileNames) {
		const workbook = new Workbook();
		await workbook.xlsx.readFile(path.join(dataDir, fileName));
		for (const worksheet of workbook.worksheets) {
			const testNameColumn = new Map<string, number>();
			worksheet.getRow(1).eachCell((cell, columnNumber) => {
				testNameColumn.set(cell.text.trim().toLowerCase(), columnNumber);
			});
			const column = testNameColumn.get('testname');
			if (!column) {
				continue;
			}
			for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
				if (worksheet.getRow(rowNumber).getCell(column).text.trim() === testName.trim()) {
					return { workbookFile: `test-data/${fileName}`, sheetName: worksheet.name };
				}
			}
		}
	}
	return undefined;
}

export async function readTestData(testName: string, source?: TestDataSource): Promise<SalesforceTestData> {
	const resolvedSource = source ?? await findTestDataSource(testName);
	if (!resolvedSource) {
		throw new Error(`No test data row found for test name "${testName}" in any workbook under test-data`);
	}
	const { workbookPath, worksheet } = await loadWorksheet(resolvedSource);
	const configPath = path.resolve(process.cwd(), process.env.CONFIG_PROPERTIES_FILE ?? 'test-data/config.properties');

	const columns = new Map<string, number>();
	worksheet.getRow(1).eachCell((cell, columnNumber) => {
		columns.set(cell.text.trim().toLowerCase(), columnNumber);
	});

	const missingColumns = requiredColumns.filter((column) => !columns.has(column));
	if (missingColumns.length > 0) {
		throw new Error(`Test data worksheet must include columns: ${missingColumns.join(', ')}`);
	}

	const testNameColumn = columns.get('testname')!;
	for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
		const row = worksheet.getRow(rowNumber);
		if (row.getCell(testNameColumn).text.trim() !== testName.trim()) {
			continue;
		}

		const matchedTestName = row.getCell(testNameColumn).text.trim();
		const getExcelValue = (column: string): string => row.getCell(columns.get(column)!).text.trim();
		const emptyFields = requiredColumns
			.filter((column) => column !== 'testname' && !getExcelValue(column));
		if (emptyFields.length > 0) {
			throw new Error(`Excel test data for "${matchedTestName}" is missing values: ${emptyFields.join(', ')}`);
		}

		const config = properties.parse(await fs.readFile(configPath, 'utf8'));
		const getValue = (field: string): string => {
			const value = config[field]?.trim() ?? '';
			return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_match, environmentVariable: string) =>
				process.env[environmentVariable]?.trim() ?? '',
			);
		};
		const applicationUrl = process.env.APPLICATION_URL?.trim() || getValue('applicationUrl');
		const website = (columns.has('website') ? getExcelValue('website') : '') || getValue('website');
		const testData: SalesforceTestData = {
			testName: matchedTestName,
			applicationUrl,
			username: getValue('username'),
			password: getValue('password'),
			website,
			salesAccountName: getExcelValue('salesaccountname'),
			country: getExcelValue('country'),
			salesRecordType: getExcelValue('salesrecordtype'),
			leadSource: getExcelValue('leadsource'),
			newAccountReason: getExcelValue('newaccountreason'),
			leadSourceDetail: getExcelValue('leadsourcedetail'),
			billingRegion: getExcelValue('billingregion'),
			billingCountry: getExcelValue('billingcountry'),
			billingState: getExcelValue('billingstate'),
			billingCity: getExcelValue('billingcity'),
			billingPostalCode: getExcelValue('billingpostalcode'),
			billingStreet: getExcelValue('billingstreet'),
			legalEntityName: getExcelValue('legalentityname'),
			legalEntityRecordType: getExcelValue('legalentityrecordtype'),
			opportunityCurrency: getExcelValue('opportunitycurrency'),
			contactFirstName: getExcelValue('contactfirstname'),
			contactLastName: getExcelValue('contactlastname'),
			contactEmail: getExcelValue('contactemail'),
			contactPhone: getExcelValue('contactphone'),
			suite: columns.has('suite') ? getExcelValue('suite') : '',
			transactionType: columns.has('transactiontype') ? getExcelValue('transactiontype') : '',
			cAndAOpportunity: columns.has('candaopportunity') ? getExcelValue('candaopportunity') : '',
			serviceFabric: columns.has('servicefabric') ? getExcelValue('servicefabric') : '',
			annualizedGaap: columns.has('annualizedgaap') ? getExcelValue('annualizedgaap') : '',
			primaryUseCase: columns.has('primaryusecase') ? getExcelValue('primaryusecase') : '',
			proposedMarket: columns.has('proposedmarket') ? getExcelValue('proposedmarket') : '',
		};
		const missingConfiguration = ['applicationUrl', 'username', 'password']
			.filter((field) => !testData[field as keyof SalesforceTestData]);
		if (missingConfiguration.length > 0) {
			throw new Error(`Configuration for "${matchedTestName}" has empty values: ${missingConfiguration.join(', ')}`);
		}
		return testData;
	}

	throw new Error(`No test data row found for test name "${testName}" in ${workbookPath}`);
}

