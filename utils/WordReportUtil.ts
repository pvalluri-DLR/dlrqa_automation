import { Document, HeadingLevel, ImageRun, Packer, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { StepActionAttachment } from './StepReportUtil';

function cleanWordText(value: string): string {
	return value
		.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
}

function screenshotTransformation(screenshot: Buffer): { width: number; height: number } {
	if (screenshot.length < 24 || screenshot.toString('ascii', 1, 4) !== 'PNG') {
		return { width: 600, height: 338 };
	}

	const sourceWidth = screenshot.readUInt32BE(16);
	const sourceHeight = screenshot.readUInt32BE(20);
	if (sourceWidth === 0 || sourceHeight === 0) {
		return { width: 600, height: 338 };
	}

	const scale = Math.min(600 / sourceWidth, 650 / sourceHeight, 1);
	return {
		width: Math.round(sourceWidth * scale),
		height: Math.round(sourceHeight * scale),
	};
}

export interface WordTestResult {
	title: string;
	status: string;
	duration: number;
	error?: string;
	steps: WordStepResult[];
	applicationUrl?: string;
	username?: string;
	country?: string;
}

export interface WordStepResult {
	stepName: string;
	timestamp: string;
	status: string;
	duration: number;
	applicationUrl?: string;
	actions?: StepActionAttachment[];
	details?: Record<string, string>;
	screenshot?: Buffer;
	error?: string;
}

export class WordReportUtil {
	async generateReport(results: WordTestResult[], outputPath = 'DLR_Reports/ExecutionReport.docx'): Promise<void> {
		const firstResult = results[0];
		const testCaseNames = [...new Set(results.map((result) =>
			path.basename(result.title.split(' > ')[0]).replace(/\.(?:spec|test)\.[^.]+$|\.[^.]+$/i, ''),
		))].join(', ') || process.env.JIRA_TEST_CASE_NAME || '';
		const failedStatuses = ['failed', 'timedOut', 'interrupted'];
		const executionFailed = results.some((result) => failedStatuses.includes(result.status));
		const executionStatus = results.length === 0
			? 'NO TESTS'
			: executionFailed
				? 'FAIL'
				: results.every((result) => result.status === 'passed')
					? 'PASS'
					: results.every((result) => result.status === 'skipped')
						? 'SKIP'
						: 'PARTIAL';
		const executionStatusFill = executionStatus === 'PASS'
			? 'E2F0D9'
			: executionStatus === 'FAIL'
				? 'FCE4D6'
				: executionStatus === 'SKIP'
					? 'FFF2CC'
					: 'E7E6E6';
		const valueCell = (text: string, fill?: string): TableCell => new TableCell({
			children: [new Paragraph(cleanWordText(text))],
			shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
		});
		const reportFieldRow = (label: string, value: string, fill?: string): TableRow => new TableRow({
			children: [
				new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cleanWordText(label), bold: true })] })] }),
				valueCell(value, fill),
			],
		});
		const metadataRows = [
			['Test Case Name', testCaseNames],
			['Application URL', firstResult?.applicationUrl || process.env.APPLICATION_URL || ''],
			['Username', firstResult?.username || ''],
			['Country/Region', firstResult?.country || ''],
			['Execution Status', executionStatus],
		].map(([label, value]) => new TableRow({
			children: [
				new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })] }),
				valueCell(value, label === 'Execution Status' ? executionStatusFill : undefined),
			],
		}));
		const stepEvidence = results.flatMap((result) => [
			new Paragraph({ text: cleanWordText(result.title), heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
			...result.steps.flatMap((step, index) => {
				const stepStatus = step.status.toLowerCase();
				const stepStatusFill = failedStatuses.includes(stepStatus)
					? 'FCE4D6'
					: stepStatus === 'passed'
						? 'E2F0D9'
						: 'FFF2CC';
				return [
					new Paragraph({
						text: cleanWordText(`Step ${index + 1}: ${step.stepName}`),
						heading: HeadingLevel.HEADING_3,
						spacing: { before: 120, after: 60 },
					}),
					new Table({
						rows: [
							reportFieldRow('Status', step.status.toUpperCase(), stepStatusFill),
							reportFieldRow('Timestamp', step.timestamp),
							...Object.entries(step.details ?? {}).map(([label, value]) => reportFieldRow(label, value, 'E2F0D9')),							...(step.error ? [reportFieldRow('Error', step.error, 'FCE4D6')] : []),
							new TableRow({
								children: [new TableCell({
									children: [step.screenshot
										? new Paragraph({
											children: [new ImageRun({ data: step.screenshot, type: 'png', transformation: screenshotTransformation(step.screenshot) })],
											spacing: { before: 240 },
										})
										: new Paragraph('Screenshot unavailable')],
									columnSpan: 2,
								})],
							}),
						],
						width: { size: 100, type: WidthType.PERCENTAGE },
					}),
				];
			}),
		]);
		const stepEvidenceSection = stepEvidence.length ? [
			new Paragraph({ text: 'Step Evidence', heading: HeadingLevel.HEADING_1, spacing: { before: 240 } }),
			...stepEvidence,
		] : [new Paragraph('No step logs or screenshots were captured.')];
		const document = new Document({
			sections: [{
				children: [
					new Paragraph({
						children: [new TextRun({ text: 'Automation Execution Report', size: 48 })],
						heading: HeadingLevel.TITLE,
					}),
					new Paragraph({ children: [new TextRun({ text: cleanWordText(`Generated: ${new Date().toLocaleString()}`), size: 24, color: 'ED7D31' })] }),
					new Table({ rows: metadataRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
					...stepEvidenceSection,
				],
			}],
		});

		await fs.mkdir(path.dirname(outputPath), { recursive: true });
		await fs.writeFile(outputPath, await Packer.toBuffer(document));
	}
}