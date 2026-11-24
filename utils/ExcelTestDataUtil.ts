import { Workbook } from 'exceljs';
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

export async function readTestData(testName: string): Promise<SalesforceTestData> {
	const workbookPath = path.resolve(process.cwd(), process.env.TEST_DATA_FILE ?? 'test-data/TestData.xlsx');
	const configPath = path.resolve(process.cwd(), process.env.CONFIG_PROPERTIES_FILE ?? 'test-data/config.properties');
	const workbook = new Workbook();
	await workbook.xlsx.readFile(workbookPath);

	const worksheet = workbook.getWorksheet('TestData') ?? workbook.worksheets[0];
	if (!worksheet) {
		throw new Error(`No worksheets found in test data workbook: ${workbookPath}`);
	}

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