# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\newlogo\DFW010\DLROTC_4912_NewLogoDFW010Test.ts >> DLROTC_4912 New Logo DFW010 Test
- Location: tests\newlogo\DFW010\DLROTC_4912_NewLogoDFW010Test.ts:8:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic:
  - generic [ref=f12e2]:
    - generic [ref=f12e3]:
      - link "Skip to Navigation" [ref=f12e4] [cursor=pointer]:
        - /url: javascript:void(0);
      - link "Skip to Main Content" [ref=f12e5] [cursor=pointer]:
        - /url: javascript:void(0);
      - generic [ref=f12e9]:
        - generic [ref=f12e13]:
          - button "Toggle Panel" [ref=f12e17] [cursor=pointer]:
            - generic [ref=f12e24]: Menu
          - generic [ref=f12e25]: Sandbox (glbluat)
        - button "Sandbox options, glbluat" [ref=f12e46] [cursor=pointer]
      - generic [ref=f12e52]:
        - button "Search" [ref=f12e59]: Search...
        - navigation "Global Header" [ref=f12e64]:
          - list [ref=f12e66]:
            - listitem [ref=f12e67]:
              - group [ref=f12e68]:
                - button "This item doesn't support favorites" [ref=f12e70] [cursor=pointer]:
                  - generic [ref=f12e71]:
                    - tooltip "This item doesn't support favorites"
                - button [ref=f12e79] [cursor=pointer]:
                  - generic [ref=f12e80]:
                    - tooltip "Favorites list"
            - listitem [ref=f12e87]:
              - button [ref=f12e93] [cursor=pointer]:
                - generic [ref=f12e94]:
                  - tooltip "Global Actions"
            - listitem [ref=f12e101]:
              - button [ref=f12e103] [cursor=pointer]:
                - generic [ref=f12e104]:
                  - tooltip "Salesforce Help"
            - listitem [ref=f12e111]:
              - button [ref=f12e117] [cursor=pointer]:
                - generic [ref=f12e118]:
                  - tooltip "Setup"
            - listitem [ref=f12e125]:
              - button [ref=f12e128] [cursor=pointer]:
                - generic [ref=f12e129]:
                  - tooltip "Notifications"
            - listitem [ref=f12e138]:
              - button "View profile" [ref=f12e141] [cursor=pointer]:
                - generic [ref=f12e142]:
                  - tooltip "View profile"
    - generic [ref=f12e146]:
      - generic [ref=f12e149]:
        - generic [ref=f12e151]:
          - navigation "App" [ref=f12e152]:
            - button "App Launcher" [ref=f12e154] [cursor=pointer]
          - heading "Sales" [level=1] [ref=f12e166]
        - navigation "Global" [ref=f12e170]:
          - list [ref=f12e171]:
            - listitem [ref=f12e172]:
              - link "Home" [ref=f12e173] [cursor=pointer]:
                - /url: /lightning/page/home
            - listitem [ref=f12e175]:
              - link "Leads" [ref=f12e176] [cursor=pointer]:
                - /url: /lightning/o/Lead/home
              - button "Leads List" [ref=f12e181] [cursor=pointer]
            - listitem [ref=f12e189]:
              - link "Contacts" [ref=f12e190] [cursor=pointer]:
                - /url: /lightning/o/Contact/home
              - button "Contacts List" [ref=f12e195] [cursor=pointer]
            - listitem [ref=f12e203]:
              - link "Opportunities" [ref=f12e204] [cursor=pointer]:
                - /url: /lightning/o/Opportunity/home
              - button "Opportunities List" [ref=f12e209] [cursor=pointer]
            - listitem [ref=f12e217]:
              - link "Accounts" [ref=f12e218] [cursor=pointer]:
                - /url: /lightning/o/Account/home
              - button "Accounts List" [ref=f12e223] [cursor=pointer]
            - listitem [ref=f12e231]:
              - link "Oracle Quotes" [ref=f12e232] [cursor=pointer]:
                - /url: /lightning/o/cafsl__Oracle_Quote__c/home
              - button "Oracle Quotes List" [ref=f12e237] [cursor=pointer]
            - listitem [ref=f12e245]:
              - link "Agreements" [ref=f12e246] [cursor=pointer]:
                - /url: /lightning/o/Apttus__APTS_Agreement__c/home
              - button "Agreements List" [ref=f12e251] [cursor=pointer]
            - listitem [ref=f12e259]:
              - link "Cases" [ref=f12e260] [cursor=pointer]:
                - /url: /lightning/o/Case/home
              - button "Cases List" [ref=f12e265] [cursor=pointer]
            - listitem [ref=f12e273]:
              - link "Tasks" [ref=f12e274] [cursor=pointer]:
                - /url: /lightning/o/Task/home
              - button "Tasks List" [ref=f12e279] [cursor=pointer]
            - listitem [ref=f12e287]:
              - link "Reports" [ref=f12e288] [cursor=pointer]:
                - /url: /lightning/o/Report/home
              - button "Reports List" [ref=f12e293] [cursor=pointer]
            - listitem [ref=f12e301]:
              - link "Dashboards" [ref=f12e302] [cursor=pointer]:
                - /url: /lightning/o/Dashboard/home
              - button "Dashboards List" [ref=f12e307] [cursor=pointer]
            - listitem [ref=f12e315]:
              - link "Chatter" [ref=f12e316] [cursor=pointer]:
                - /url: /lightning/page/chatter
            - listitem [ref=f12e318]:
              - link "D&B Hoovers" [ref=f12e319] [cursor=pointer]:
                - /url: /lightning/n/iSell__Avention
            - listitem [ref=f12e321]:
              - link "* TestQA__1119262040_GU_USA | Account Management" [ref=f12e322] [cursor=pointer]:
                - /url: /lightning/r/Account_Mgmt__c/aIucX000000DMabSAG/view
                - generic "Not added to nav bar" [ref=f12e323]: "*"
                - generic [ref=f12e324]: TestQA__1119262040_GU_USA | Account Management
              - button "TestQA__1119262040_GU_USA | Account Management List" [ref=f12e328] [cursor=pointer]
              - button "Close tab" [ref=f12e336] [cursor=pointer]
            - listitem [ref=f12e344]:
              - button "Show more navigation items" [ref=f12e346] [cursor=pointer]:
                - generic [aria-hidden] [ref=f12e347]: More
            - listitem [ref=f12e355]:
              - button "Edit nav items" [ref=f12e357] [cursor=pointer]
      - main [ref=f12e364]:
        - generic [active] [ref=f12e368]:
          - text: Loading report chart...
          - generic [ref=f12e372]:
            - generic:
              - generic:
                - status:
                  - generic [ref=f12e373]: Loading
            - iframe [ref=f12e376]
    - generic:
      - contentinfo "Utility Bar":
        - list [ref=f12e379]:
          - listitem [ref=f12e380]:
            - button "To Do List" [ref=f12e383] [cursor=pointer]
  - status [ref=f12e392]: Success notification.Account Management "TestQA__1119262040_GU_USA" was created. Press Control + F6 to navigate to the next toast notification or focusable region.
```

# Test source

```ts
  1   | import type { Locator, Page } from '@playwright/test';
  2   | import { runStepAction } from './StepReportUtil';
  3   | 
  4   | export class PlaywrightUtil {
  5   | 	constructor(private readonly page: Page) {}
  6   | 
  7   | 	private describeField(target: string | Locator): string {
  8   | 		if (typeof target === 'string') {
  9   | 			return target;
  10  | 		}
  11  | 		const description = target.toString();
  12  | 		const match = description.match(/name: '([^']*)'/) ?? description.match(/getBy(?:Label|Text|Placeholder)\('([^']*)'/);
  13  | 		return match ? match[1] : description;
  14  | 	}
  15  | 
  16  | 	private displayValue(field: string, value: string): string {
  17  | 		return /password/i.test(field) ? '********' : value;
  18  | 	}
  19  | 
  20  | 	private getLocator(selector: string | Locator): Locator {
  21  | 		return typeof selector === 'string' ? this.page.locator(selector) : selector;
  22  | 	}
  23  | 
  24  | 	async navigate(url: string): Promise<void> {
  25  | 		await runStepAction(this.page, 'Navigate to URL', async () => {
  26  | 			await this.page.goto(url);
  27  | 		});
  28  | 	}
  29  | 
  30  | 	async click(selector: string | Locator): Promise<void> {
  31  | 		await runStepAction(this.page, `Clicked on "${this.describeField(selector)}"`, async () => {
  32  | 			await this.getLocator(selector).click();
  33  | 		});
  34  | 	}
  35  | 
  36  | 	async fill(selector: string | Locator, value: string): Promise<void> {
  37  | 		const field = this.describeField(selector);
  38  | 		await runStepAction(this.page, `Entered value - "${this.displayValue(field, value)}" in the "${field}"`, async () => {
  39  | 			await this.getLocator(selector).fill(value);
  40  | 		});
  41  | 	}
  42  | 
  43  | 	async typeCharacterByCharacter(selector: string | Locator, value: string): Promise<void> {
  44  | 		const field = this.describeField(selector);
  45  | 		await runStepAction(this.page, `Entered value - "${this.displayValue(field, value)}" in the "${field}"`, async () => {
  46  | 			await this.getLocator(selector).pressSequentially(value);
  47  | 		});
  48  | 	}
  49  | 
  50  | 	async press(selector: string | Locator, key: string): Promise<void> {
  51  | 		await runStepAction(this.page, `Press ${key} in "${this.describeField(selector)}"`, async () => {
  52  | 			await this.getLocator(selector).press(key);
  53  | 		});
  54  | 	}
  55  | 
  56  | 	async selectOption(selector: string | Locator, value: string): Promise<void> {
  57  | 		const field = this.describeField(selector);
  58  | 		await runStepAction(this.page, `Selected value - "${value}" from the dropdown "${field}"`, async () => {
  59  | 			await this.getLocator(selector).selectOption(value);
  60  | 		});
  61  | 	}
  62  | 
  63  | 	async selectFromDropdown(dropdown: string | Locator, option: string | Locator, value: string): Promise<void> {
  64  | 		const field = this.describeField(dropdown);
  65  | 		await runStepAction(this.page, `Selected value - "${value}" from the dropdown "${field}"`, async () => {
  66  | 			await this.getLocator(dropdown).click();
  67  | 			await this.getLocator(option).click();
  68  | 		});
  69  | 	}
  70  | 
  71  | 	async check(selector: string | Locator): Promise<void> {
  72  | 		await runStepAction(this.page, `Checked "${this.describeField(selector)}"`, async () => {
  73  | 			await this.getLocator(selector).check();
  74  | 		});
  75  | 	}
  76  | 
  77  | 	async uncheck(selector: string | Locator): Promise<void> {
  78  | 		await runStepAction(this.page, `Unchecked "${this.describeField(selector)}"`, async () => {
  79  | 			await this.getLocator(selector).uncheck();
  80  | 		});
  81  | 	}
  82  | 
  83  | 	async waitForVisible(selector: string | Locator): Promise<void> {
  84  | 		await runStepAction(this.page, `Wait for "${this.describeField(selector)}" to be visible`, async () => {
  85  | 			await this.getLocator(selector).waitFor({ state: 'visible' });
  86  | 		});
  87  | 	}
  88  | 
  89  | 	async waitForPageLoad(): Promise<void> {
  90  | 		await runStepAction(this.page, 'Wait for page to load', async () => {
  91  | 			await this.page.waitForLoadState('load');
  92  | 		});
  93  | 	}
  94  | 
  95  | 	async waitForTimeout(milliseconds: number): Promise<void> {
  96  | 		await runStepAction(this.page, `Wait ${milliseconds} ms`, async () => {
> 97  | 			await this.page.waitForTimeout(milliseconds);
      |                    ^ Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
  98  | 		});
  99  | 	}
  100 | }
  101 | 
```