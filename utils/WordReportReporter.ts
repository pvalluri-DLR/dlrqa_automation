import type { FullConfig, FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { WordReportUtil, WordStepResult, WordTestResult } from './WordReportUtil';
import { readTestData } from './ExcelTestDataUtil';

interface TransactionId {
  label: string;
  value: string;
}

interface TestReportLinks {
  videoHref?: string;
  traceHref?: string;
  transactionIds: TransactionId[];
}

interface SummaryEntry {
  result: WordTestResult;
  testName: string;
  reportPath: string;
  sourceFile: string;
  links: TestReportLinks;
}

const SALESFORCE_RECORD_URL = /\/r\/([A-Za-z0-9_]+)\/([a-zA-Z0-9]{15,18})\//;
const TRANSACTION_LABEL = /\b(id|number|transaction|quote|opportunity|order)\b/i;

function extractTransactionIds(steps: WordStepResult[]): TransactionId[] {
  const found = new Map<string, TransactionId>();
  for (const step of steps) {
    for (const [label, value] of Object.entries(step.details ?? {})) {
      if (TRANSACTION_LABEL.test(label) && value.trim()) found.set(`${label}|${value}`, { label, value });
    }
    const match = step.applicationUrl?.match(SALESFORCE_RECORD_URL);
    if (match) found.set(`sf|${match[2]}`, { label: `Salesforce ${match[1]} ID`, value: match[2] });
  }
  return [...found.values()];
}

function relativeHref(fromDirectory: string, target: string): string {
  return path.relative(fromDirectory, target).split(path.sep).map(encodeURIComponent).join('/');
}

function linksCell(links: TestReportLinks): string {
  const parts = [
    links.videoHref ? `<a href="${escapeHtml(links.videoHref)}">Video</a>` : '',
    links.traceHref ? `<a href="${escapeHtml(links.traceHref)}">Trace</a>` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
}

function transactionIdsCell(ids: TransactionId[]): string {
  return ids.length
    ? ids.map((id) => `<div><strong>${escapeHtml(id.label)}:</strong> ${escapeHtml(id.value)}</div>`).join('')
    : '—';
}

const BUILT_IN_THEME_MARKER = '<!-- htmlReports-theme -->';
const BUILT_IN_THEME_CSS = `
  :root { font-family: "Segoe UI", sans-serif; }
  body { background: #f2f5f6; }
`;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function createHtmlReport(
  result: WordTestResult,
  testName: string,
  sourceFile: string,
  links: TestReportLinks,
  environment: Record<string, string>,
): string {
  const status = result.status.toUpperCase();
  const statusClass = result.status.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const passedSteps = result.steps.filter((step) => step.status === 'passed').length;
  const failedSteps = result.steps.filter((step) => ['failed', 'timedOut', 'interrupted'].includes(step.status)).length;
  const steps = result.steps.length
    ? result.steps.map((step, index) => {
      const actionSearchText = step.actions?.map((action) => `${action.action} ${action.status} ${action.error ?? ''}`).join(' ') ?? '';
      const actionLogs = step.actions?.length
        ? `<ol class="action-log">${step.actions.map((action) => `
          <li>
            <time>${escapeHtml(action.timestamp)}</time>
            <span class="badge ${escapeHtml(action.status.toLowerCase())}">${escapeHtml(action.status.toUpperCase())}</span>
            <span class="action-name">${escapeHtml(action.action)}</span>
            ${action.error ? `<pre class="error">${escapeHtml(action.error)}</pre>` : ''}
          </li>`).join('')}
        </ol>`
        : '';
      return `
      <tr class="step-row" data-status="${escapeHtml(step.status.toLowerCase())}" data-search="${escapeHtml(`${step.stepName} ${step.status} ${step.error ?? ''} ${actionSearchText}`.toLowerCase())}">
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(step.stepName)}</strong>${step.error ? `<pre class="error">${escapeHtml(step.error)}</pre>` : ''}${actionLogs}${Object.entries(step.details ?? {}).map(([label, value]) => `<p class="step-detail"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}</td>
        <td><span class="badge ${escapeHtml(step.status.toLowerCase())}">${escapeHtml(step.status.toUpperCase())}</span></td>
        <td>${escapeHtml(step.timestamp)}</td>
        <td>${step.screenshot ? `<details><summary>View screenshot</summary><img src="data:image/png;base64,${step.screenshot.toString('base64')}" alt="Screenshot for ${escapeHtml(step.stepName)}"></details>` : 'Screenshot unavailable'}</td>
      </tr>`;
    }).join('')
    : '<tr><td colspan="5" class="empty">No step logs or screenshots were captured.</td></tr>';
  const statusLabel = (value: string): string => value === 'passed' ? 'PASS' : value === 'skipped' ? 'SKIP' : ['failed', 'timedOut', 'interrupted'].includes(value) ? 'FAIL' : value.toUpperCase();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>htmlReports | ${escapeHtml(testName)}</title>
  <style>
    :root { color-scheme: light; font-family: "Segoe UI", sans-serif; color: #26333d; background: #f2f5f6; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    header { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 18px clamp(18px, 4vw, 56px); background: #183746; color: #fff; }
    header h1 { margin: 0; font-size: 22px; }
    header span { color: #c7d9df; font-size: 13px; }
    main { max-width: 1240px; margin: 26px auto; padding: 0 20px; }
    h2 { margin: 0 0 16px; font-size: 19px; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 22px; }
    .metric, .panel { background: white; border: 1px solid #d9e1e5; border-radius: 5px; }
    .metric { padding: 15px 17px; }
    .metric-label { display: block; color: #586973; font-size: 12px; text-transform: uppercase; }
    .metric-value { display: block; margin-top: 7px; font-size: 22px; font-weight: 650; }
    .panel { margin-bottom: 18px; overflow: hidden; }
    .panel-heading { padding: 16px 18px; border-bottom: 1px solid #e2e7ea; }
    .panel-body { padding: 18px; }
    .badge { display: inline-block; border-radius: 3px; padding: 5px 9px; font-size: 11px; font-weight: 700; }
    .passed { color: #17633a; background: #e1f3e8; }
    .failed, .timedout, .interrupted { color: #8b2525; background: #fbe5e3; }
    .skipped { color: #765514; background: #fff1cc; }
    .metadata { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 10px 18px; margin: 0; }
    .metadata dt { color: #586973; font-weight: 600; }
    .metadata dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
    .error { margin: 10px 0 0; padding: 12px; white-space: pre-wrap; overflow-wrap: anywhere; color: #812b27; background: #fff2f0; border-left: 3px solid #c74e43; }
    .action-log { margin: 10px 0 0; padding: 8px 0 0 22px; border-top: 1px solid #e3e8ea; }
    .action-log li { margin: 7px 0; }
    .action-log time { margin-right: 7px; color: #586973; font-size: 11px; white-space: nowrap; }
    .action-name { margin-left: 7px; overflow-wrap: anywhere; }
    .filters { display: flex; flex-wrap: wrap; gap: 8px; }
    input, select { min-height: 36px; padding: 7px 10px; border: 1px solid #bdc9cf; border-radius: 4px; background: white; color: inherit; }
    input { flex: 1 1 220px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th, td { padding: 11px 12px; border-bottom: 1px solid #e3e8ea; vertical-align: top; }
    th { color: #52636c; background: #f6f8f9; font-size: 11px; text-transform: uppercase; white-space: nowrap; }
    td:nth-child(1), td:nth-child(4) { white-space: nowrap; }
    a { color: #12647a; }
    details summary { display: inline-block; padding: 6px 9px; border: 1px solid #bdc9cf; border-radius: 4px; color: #12647a; background: #fff; cursor: pointer; font-weight: 600; }
    details img { display: block; width: min(720px, 80vw); height: auto; margin-top: 10px; border: 1px solid #d9e1e5; }
    .empty { padding: 20px; text-align: center; color: #586973; }
    @media (max-width: 700px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .metadata { grid-template-columns: 1fr; gap: 4px; } .metadata dd { margin-bottom: 8px; } }
  </style>
</head>
<body>
  <header><h1>htmlReports</h1><span>Generated ${escapeHtml(new Date().toLocaleString())}</span></header>
  <main>
    <section class="metrics" aria-label="Test summary">
      <div class="metric"><span class="metric-label">Tests</span><span class="metric-value">1</span></div>
      <div class="metric"><span class="metric-label">Result</span><span class="metric-value"><span class="badge ${escapeHtml(statusClass)}">${escapeHtml(statusLabel(result.status))}</span></span></div>
      <div class="metric"><span class="metric-label">Passed Steps</span><span class="metric-value">${passedSteps}</span></div>
      <div class="metric"><span class="metric-label">Failed Steps</span><span class="metric-value">${failedSteps}</span></div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>Test Details</h2></div>
      <div class="panel-body"><dl class="metadata">
        <dt>Test Name</dt><dd>${escapeHtml(testName)}</dd>
        <dt>Status</dt><dd><span class="badge ${escapeHtml(statusClass)}">${escapeHtml(status)}</span></dd>
        <dt>Duration</dt><dd>${result.duration} ms</dd>
        <dt>Test File</dt><dd>${escapeHtml(path.relative(process.cwd(), sourceFile))}</dd>
        <dt>Application URL</dt><dd>${result.applicationUrl ? `<a href="${escapeHtml(result.applicationUrl)}" target="_blank" rel="noreferrer">${escapeHtml(result.applicationUrl)}</a>` : '—'}</dd>
        <dt>Video</dt><dd>${links.videoHref ? `<a href="${escapeHtml(links.videoHref)}">${escapeHtml(links.videoHref)}</a>` : '—'}</dd>
        <dt>Trace</dt><dd>${links.traceHref ? `<a href="${escapeHtml(links.traceHref)}">${escapeHtml(links.traceHref)}</a>` : '—'}</dd>
      </dl>${result.error ? `<pre class="error">${escapeHtml(result.error)}</pre>` : ''}</div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>Transaction IDs</h2></div>
      <div class="panel-body">${transactionIdsCell(links.transactionIds)}</div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>Environment</h2></div>
      <div class="panel-body"><dl class="metadata">
        ${Object.entries(environment).map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join('\n        ')}
      </dl></div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>Step Details</h2></div>
      <div class="panel-body"><div class="filters">
        <input id="step-search" type="search" placeholder="Search steps or errors" aria-label="Search step details">
        <select id="status-filter" aria-label="Filter by step status"><option value="all">All statuses</option><option value="passed">Passed</option><option value="failed">Failed</option><option value="skipped">Skipped</option></select>
      </div></div>
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Step</th><th>Status</th><th>Timestamp</th><th>Screenshot</th></tr></thead><tbody>${steps}</tbody></table></div>
    </section>
  </main>
  <script>
    const search = document.querySelector('#step-search');
    const statusFilter = document.querySelector('#status-filter');
    const rows = [...document.querySelectorAll('.step-row')];
    function filterRows() {
      const query = search.value.trim().toLowerCase();
      const selectedStatus = statusFilter.value;
      rows.forEach((row) => {
        row.hidden = (selectedStatus !== 'all' && row.dataset.status !== selectedStatus) || !row.dataset.search.includes(query);
      });
    }
    search.addEventListener('input', filterRows);
    statusFilter.addEventListener('change', filterRows);
  </script>
</body>
</html>`;
}

function createSummaryHtml(entries: SummaryEntry[], environment: Record<string, string>): string {
  const failedStatuses = ['failed', 'timedOut', 'interrupted'];
  const passedCount = entries.filter(({ result }) => result.status === 'passed').length;
  const failedCount = entries.filter(({ result }) => failedStatuses.includes(result.status)).length;
  const skippedCount = entries.filter(({ result }) => result.status === 'skipped').length;
  const totalDuration = entries.reduce((duration, { result }) => duration + result.duration, 0);
  const passRate = entries.length ? Math.round((passedCount / entries.length) * 100) : 0;
  const overallStatus = failedCount ? 'failed' : entries.length ? 'passed' : 'skipped';
  const failingTests = entries.filter(({ result }) => failedStatuses.includes(result.status));
  const failingList = failingTests.length
    ? `<ul class="failing-list">${failingTests.map(({ testName, result }) => `<li><strong>${escapeHtml(testName)}</strong>${result.error ? `<span> — ${escapeHtml(result.error.split('\n')[0])}</span>` : ''}</li>`).join('')}</ul>`
    : '<p class="unavailable">No failing tests.</p>';
  const rows = entries.length
    ? entries.map(({ result, testName, reportPath, sourceFile, links }) => {
      const statusClass = result.status.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const href = reportPath.split(path.sep).map(encodeURIComponent).join('/');
      const failedSteps = result.steps.filter((step) => failedStatuses.includes(step.status));
      const failureEvidence = failedSteps.length
        ? failedSteps.map((step) => `
          <section class="failure-step">
            <strong>${escapeHtml(step.stepName)}</strong>
            <p>${escapeHtml(step.status.toUpperCase())} | ${step.duration} ms | ${escapeHtml(step.timestamp)}</p>
            ${step.error ? `<pre class="error">${escapeHtml(step.error)}</pre>` : ''}
            ${step.screenshot
              ? `<details><summary>View failed-step screenshot</summary><img src="data:image/png;base64,${step.screenshot.toString('base64')}" alt="Failure screenshot for ${escapeHtml(step.stepName)}"></details>`
              : '<p class="unavailable">Screenshot unavailable</p>'}
          </section>`).join('')
        : result.error
          ? `<pre class="error">${escapeHtml(result.error)}</pre>`
          : '—';
      return `<tr>
        <td><a href="${escapeHtml(href)}">${escapeHtml(testName)}</a></td>
        <td><span class="badge ${escapeHtml(statusClass)}">${escapeHtml(result.status.toUpperCase())}</span></td>
        <td>${result.duration} ms</td>
        <td>${escapeHtml(path.relative(process.cwd(), sourceFile))}</td>
        <td>${linksCell(links)}</td>
        <td>${transactionIdsCell(links.transactionIds)}</td>
        <td>${failureEvidence}</td>
      </tr>`;
    }).join('')
    : '<tr><td colspan="7" class="empty">No tests were recorded.</td></tr>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Execution Summary</title>
  <style>
    :root { color-scheme: light; font-family: "Segoe UI", sans-serif; color: #26333d; background: #f2f5f6; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    header { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 18px clamp(18px, 4vw, 56px); background: #183746; color: #fff; }
    header h1 { margin: 0; font-size: 22px; }
    header span { color: #c7d9df; font-size: 13px; }
    main { max-width: 1240px; margin: 26px auto; padding: 0 20px; }
    .metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-bottom: 22px; }
    .metric, .panel { background: white; border: 1px solid #d9e1e5; border-radius: 5px; }
    .metric { padding: 15px 17px; }
    .metric-label { display: block; color: #586973; font-size: 12px; text-transform: uppercase; }
    .metric-value { display: block; margin-top: 7px; font-size: 22px; font-weight: 650; }
    .panel { overflow: hidden; }
    .panel-heading { padding: 16px 18px; border-bottom: 1px solid #e2e7ea; }
    .panel-heading h2 { margin: 0; font-size: 19px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th, td { padding: 11px 12px; border-bottom: 1px solid #e3e8ea; vertical-align: top; }
    th { color: #52636c; background: #f6f8f9; font-size: 11px; text-transform: uppercase; white-space: nowrap; }
    a { color: #12647a; }
    .badge { display: inline-block; border-radius: 3px; padding: 5px 9px; font-size: 11px; font-weight: 700; }
    .passed { color: #17633a; background: #e1f3e8; }
    .failed, .timedout, .interrupted { color: #8b2525; background: #fbe5e3; }
    .skipped { color: #765514; background: #fff1cc; }
    .error { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; color: #812b27; }
    .failure-step { min-width: 260px; margin-bottom: 12px; }
    .failure-step:last-child { margin-bottom: 0; }
    .failure-step p { margin: 5px 0; color: #586973; font-size: 12px; }
    .unavailable { color: #586973; font-style: italic; }
    details summary { display: inline-block; padding: 6px 9px; border: 1px solid #bdc9cf; border-radius: 4px; color: #12647a; background: #fff; cursor: pointer; font-weight: 600; }
    details img { display: block; width: min(480px, 60vw); height: auto; margin-top: 8px; border: 1px solid #d9e1e5; }
    .empty { padding: 20px; text-align: center; color: #586973; }
    .failing-list { margin: 0; padding-left: 20px; }
    .failing-list li { margin: 6px 0; }
    .failing-list span { color: #812b27; }
    .metadata { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 10px 18px; margin: 0; }
    .metadata dt { color: #586973; font-weight: 600; }
    .metadata dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
    .panel-body { padding: 18px; }
    .panel + .panel { margin-top: 18px; }
    .unavailable { color: #586973; font-style: italic; }
    .empty { padding: 20px; text-align: center; color: #586973; }
    @media (max-width: 800px) { .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
</head>
<body>
  <header><h1>Execution Summary</h1><span>Generated ${escapeHtml(new Date().toLocaleString())}</span></header>
  <main>
    <section class="metrics" aria-label="Execution totals">
      <div class="metric"><span class="metric-label">Overall</span><span class="metric-value"><span class="badge ${escapeHtml(overallStatus)}">${escapeHtml(overallStatus.toUpperCase())}</span></span></div>
      <div class="metric"><span class="metric-label">Tests</span><span class="metric-value">${entries.length}</span></div>
      <div class="metric"><span class="metric-label">Pass Rate</span><span class="metric-value">${passRate}%</span></div>
      <div class="metric"><span class="metric-label">Passed / Failed / Skipped</span><span class="metric-value">${passedCount} / ${failedCount} / ${skippedCount}</span></div>
      <div class="metric"><span class="metric-label">Total Duration</span><span class="metric-value">${totalDuration} ms</span></div>
      <div class="metric"><span class="metric-label">Environment</span><span class="metric-value">${escapeHtml(environment['Base URL'] ?? 'Not set')}</span></div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>Executive Summary</h2></div>
      <div class="panel-body">${failingList}</div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>Environment Information</h2></div>
      <div class="panel-body"><dl class="metadata">
        ${Object.entries(environment).map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`).join('\n        ')}
      </dl></div>
    </section>
    <section class="panel">
      <div class="panel-heading"><h2>Test Results</h2></div>
      <div class="table-wrap"><table><thead><tr><th>Test</th><th>Status</th><th>Duration</th><th>Test File</th><th>Video / Trace</th><th>Transaction IDs</th><th>Failure Evidence</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>
  </main>
</body>
</html>`;
}

export default class WordReportReporter implements Reporter {
  private results: Array<{ testId: string; result: WordTestResult; sourceFile: string; videoPath?: string; tracePath?: string }> = [];
  private pendingResults: Promise<void>[] = [];
  private environment: Record<string, string> = {};
  private readonly runReportRoot = path.join('DLR_Reports', runFolderName());

  onBegin(config: FullConfig): void {
    const project = config.projects[0];
    this.environment = {
      'Base URL': String(project?.use.baseURL ?? 'Not set'),
      Projects: config.projects.map((item) => item.name).join(', ') || 'None',
      Workers: String(config.workers),
      Retries: String(project?.retries ?? 0),
      'Operating System': `${os.type()} ${os.release()}`,
      'Node.js': process.version,
      Host: os.hostname(),
    };
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const video = result.attachments.find((attachment) => attachment.contentType === 'video/webm' && attachment.path);
    if (video) {
      video.name = test.title;
    }
    this.pendingResults.push(this.collectResult(test, result));
  }

  private async collectResult(test: TestCase, result: TestResult): Promise<void> {
    const steps: WordStepResult[] = result.attachments
      .filter((attachment) => attachment.contentType === 'application/json' && attachment.name.startsWith('word-report-step-'))
      .flatMap((attachment) => {
        try {
          const data = JSON.parse(attachment.body?.toString() ?? '{}');
          return [{ ...data, screenshot: data.screenshot ? Buffer.from(data.screenshot, 'base64') : undefined }];
        } catch {
          return [];
        }
      });
    const failureScreenshot = result.attachments.find((attachment) =>
      attachment.name === 'screenshot' && attachment.contentType === 'image/png',
    );
    if (failureScreenshot) {
      let screenshot = failureScreenshot.body;
      if (!screenshot && failureScreenshot.path) {
        try {
          screenshot = await fs.readFile(failureScreenshot.path);
        } catch {
          screenshot = undefined;
        }
      }
      if (screenshot) {
        for (let index = steps.length - 1; index >= 0; index--) {
          if (['failed', 'timedOut', 'interrupted'].includes(steps[index].status) && !steps[index].screenshot) {
            steps[index].screenshot = screenshot;
            break;
          }
        }
      }
    }

    const testData = await readTestData(test.title).catch(() => undefined);
    const videoPath = result.attachments.find((attachment) => attachment.contentType === 'video/webm' && attachment.path)?.path;
    const tracePath = result.attachments.find((attachment) => attachment.name === 'trace' && attachment.path)?.path;

    this.results.push({
      testId: test.id,
      videoPath,
      tracePath,
      result: {
        title: test.titlePath().filter((part) => part.trim().length > 0).join(' > '),
        status: result.status,
        duration: result.duration,
        error: result.error?.message,
        steps,
        applicationUrl: steps[0]?.applicationUrl,
        username: testData?.username,
        country: testData?.billingCountry,
      },
      sourceFile: test.location.file,
    });
  }

  async onExit(): Promise<void> {
    const indexPath = path.resolve(process.cwd(), 'playwright-report', 'index.html');
    const html = await fs.readFile(indexPath, 'utf8').catch(() => undefined);
    if (!html || html.includes(BUILT_IN_THEME_MARKER)) return;
    const themed = html
      .replace(/<title>[^<]*<\/title>/, '<title>htmlReports</title>')
      .replace('</head>', `${BUILT_IN_THEME_MARKER}<style>${BUILT_IN_THEME_CSS}</style></head>`);
    await fs.writeFile(indexPath, themed, 'utf8');
  }

  async onEnd(_result: FullResult): Promise<void> {
    await Promise.all(this.pendingResults);
    const reportUtil = new WordReportUtil();
    const latestByTest = new Map<string, (typeof this.results)[number]>();
    for (const entry of this.results) latestByTest.set(entry.testId, entry);
    const finalResults = [...latestByTest.values()];
    const baseNameCounts = new Map<string, number>();

    for (const { result, sourceFile } of finalResults) {
      const relativeSourceFile = path.relative(process.cwd(), sourceFile);
      const outputDirectory = path.join(this.runReportRoot, path.dirname(relativeSourceFile));
      const testName = result.title.split(' > ').pop()?.trim() || path.basename(sourceFile, path.extname(sourceFile));
      const safeTestName = testName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/[. ]+$/g, '');
      const basePath = path.resolve(outputDirectory, safeTestName).toLowerCase();
      baseNameCounts.set(basePath, (baseNameCounts.get(basePath) ?? 0) + 1);
    }

    const usedPaths = new Set<string>();
    const usedArtifactNames = new Set<string>();
    const summaryEntries: SummaryEntry[] = [];
    for (const { result, sourceFile, videoPath, tracePath } of finalResults) {
      const relativeSourceFile = path.relative(process.cwd(), sourceFile);
      const outputDirectory = path.join(this.runReportRoot, path.dirname(relativeSourceFile));
      const testName = result.title.split(' > ').pop()?.trim() || path.basename(sourceFile, path.extname(sourceFile));
      const safeTestName = testName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/[. ]+$/g, '');
      const basePath = path.resolve(outputDirectory, safeTestName).toLowerCase();
      const sourceName = path.basename(sourceFile, path.extname(sourceFile)).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
      let reportName = baseNameCounts.get(basePath)! > 1 ? `${safeTestName}_${sourceName}` : safeTestName;
      let reportBasePath = path.join(outputDirectory, reportName);
      let suffix = 2;
      while (usedPaths.has(reportBasePath.toLowerCase())) {
        reportName = `${safeTestName}_${sourceName}_${suffix++}`;
        reportBasePath = path.join(outputDirectory, reportName);
      }
      usedPaths.add(reportBasePath.toLowerCase());
      await fs.mkdir(outputDirectory, { recursive: true });

      let artifactName = safeTestName;
      let artifactSuffix = 2;
      while (usedArtifactNames.has(artifactName.toLowerCase())) {
        artifactName = `${safeTestName}_${artifactSuffix++}`;
      }
      usedArtifactNames.add(artifactName.toLowerCase());
      const videoTarget = `${reportBasePath}.webm`;
      const traceTarget = path.join(this.runReportRoot, 'traces', `${artifactName}.zip`);
      if (videoPath) {
        await fs.copyFile(videoPath, videoTarget);
      }
      if (tracePath) {
        await fs.mkdir(path.dirname(traceTarget), { recursive: true });
        await fs.copyFile(tracePath, traceTarget);
      }
      const transactionIds = extractTransactionIds(result.steps);
      const pageLinks: TestReportLinks = {
        transactionIds,
        videoHref: videoPath ? relativeHref(outputDirectory, videoTarget) : undefined,
        traceHref: tracePath ? relativeHref(outputDirectory, traceTarget) : undefined,
      };
      const summaryLinks: TestReportLinks = {
        transactionIds,
        videoHref: videoPath ? relativeHref(this.runReportRoot, videoTarget) : undefined,
        traceHref: tracePath ? relativeHref(this.runReportRoot, traceTarget) : undefined,
      };

      const htmlReportPath = `${reportBasePath}.html`;
      await fs.writeFile(htmlReportPath, createHtmlReport(result, testName, sourceFile, pageLinks, this.environment), 'utf8');
      await reportUtil.generateReport([result], `${reportBasePath}.docx`);
      summaryEntries.push({ result, testName, reportPath: path.relative(this.runReportRoot, htmlReportPath), sourceFile, links: summaryLinks });
    }

    await fs.mkdir(this.runReportRoot, { recursive: true });
    await fs.writeFile(path.join(this.runReportRoot, 'SummayReport.html'), createSummaryHtml(summaryEntries, this.environment), 'utf8');
  }
}

function runFolderName(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const date = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear()}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `Run_${date}_${time}`;
}
