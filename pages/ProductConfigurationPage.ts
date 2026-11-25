import { FrameLocator, Page, test } from '@playwright/test';
import { PlaywrightUtil } from '../utils/PlaywrightUtil';

export class ProductConfigurationPage {
	private readonly playwright: PlaywrightUtil;

	private readonly CAGE_ARRAY_ID_STR = '_setv2_cageArraySet_pL-arraySet-summary';
	private readonly CABINET_ARRAY_ID_STR = '_setcabinetArraySet_pL-arraySet-summary';
	private readonly CAGE_TYPE_ID_STR = 'Type_cage';
	private readonly CABINET_TYPE_ID_STR = 'cabinetType';
	private readonly CABINET_HEIGHT_ID_STR = 'cabinetHeight';
	private readonly CABINET_MODEL_ID_STR = 'manufacturerModel';
	private readonly CABINET_DIMENSIONS_ID_STR = 'cabinetDimension';
	private readonly CABINET_QUANTITY_ID_STR = 'numberOfCabinets';
	private readonly CABINET_KW_PER_CABINET_ID_STR = 'kWPerCabinet';
	private readonly CABINET_RACK_SELECTION_ARRAY_ID_STR = '_cabinetRackSelection_pL';
	private readonly PACK_ARRAY_ID_STR = '_setstandardPackMandatoryAttrsArray-arraySet-summary';
	private readonly PACK_TYPE_ID_STR = 'packType';
	private readonly PACK_CAPACITY_ID_STR = 'packCapacity';
	private readonly PACK_QUANTITY_ID_STR = 'quantityPack';
	private readonly POWER_CIRCUIT_ARRAY_ID_STR = '_setpowerCircuitSelectionArraySet_pL-arraySet-summary';
	private readonly VOLTS_PHASE_ID_STR = 'voltsPhaseAnB';
	private readonly AMPS_ID_STR = 'amps';
	private readonly POWER_CIRCUIT_QTY_ID_STR = 'powerCircuitQuantity';
	private readonly POWER_CIRCUIT_ID_STR = 'powerCircuit_pL';
	private readonly CIRCUIT_CONFIG_ID_STR = 'circuitConfiguration';
	private readonly CAGE_IDENTIFIER_ID_STR = 'cageUIDInCabinet';
	private readonly CABINET_CUSTOM_LENGTH_ID_STR = 'customCabinetLength';
	private readonly CABINET_CUSTOM_WIDTH_ID_STR = 'customCabinetWidth';
	private readonly CABINET_CUSTOM_HEIGHT_ID_STR = 'customCabinetHeight';
	private readonly CABINET_MAX_WEIGHT_ID_STR = 'cabinetMaxWeight';
	private readonly HD_CAGE_CABINET_TYPE_ID_STR = 'hDCageCabinetType';
	private readonly KW_ARRAY_ID_STR = '_setv2_kWPowerArraySet_pL-arraySet-summary';
	private readonly KW_POWER_TYPE_ID_STR = 'powerType';
	private readonly KW_QUANTITY_ID_STR = 'kWPowerQty_arr';
	private readonly PRECABLING_PRODUCT_NAME_ID_STR = 'productName';
	private readonly PRECABLING_TYPE_ID_STR = 'packTypeArray_pL';
	private readonly PRECABLING_SIZE_ID_STR = 'packCapacityArray_pL';
	private readonly PRECABLING_QUANTITY_ID_STR = 'quantityPack_pL';

	constructor(private readonly page: Page) {
		this.playwright = new PlaywrightUtil(page);
	}

	

	private async switchToCanvasInnerFrame(): Promise<FrameLocator> {
        await this.playwright.waitForTimeout(40000);
        const outerFrameId = 'canvas-outer-_:Oracle_Adapter:embeddedTransactionCanvas';
        const innerFrameId = 'canvas-inner-_:Oracle_Adapter:embeddedTransactionCanvas';
        const cpqMainFrameXpath = "xpath=(//*[@title='accessibility title'])[last()]";
        const cpqMainFrameExists = await this.page.locator(cpqMainFrameXpath)
            .waitFor({ state: 'attached', timeout: 15000 })
            .then(() => true)
            .catch(() => false);
        let root: Page | FrameLocator = this.page;
        if (cpqMainFrameExists) {
            root = this.page.frameLocator(cpqMainFrameXpath);
        }
        const outerFrame = root.frameLocator(`iframe[name="${outerFrameId}"]`);
        return outerFrame.frameLocator(`iframe[name="${innerFrameId}"]`);
    }
	async clickNewDeployment(): Promise<void> {
        await this.playwright.waitForPageLoad();
        const innerFrame = await this.switchToCanvasInnerFrame();
        const newDeploymentButton = innerFrame
            .locator("xpath=//span[text()='New Deployment']")
            .filter({ visible: true })
            .first();
        await newDeploymentButton.waitFor({ state: 'visible', timeout: 60000 });
        await this.playwright.click(newDeploymentButton);
    }

	async selectSuite(suite: string): Promise<void> {
        await this.playwright.waitForTimeout(20000);
         const innerFrame = await this.switchToCanvasInnerFrame();
        await this.playwright.waitForPageLoad();
        const suiteSelectionInput = innerFrame.locator("xpath=//input[@type='text' and contains(@id, 'suite_selector')]").filter({ visible: true }).first();
        const suiteOption = innerFrame.locator(`xpath=//*[@id='oj-listbox-results-suite_selector_pF-combobox']/li[*[@aria-label='${suite}']]`).filter({ visible: true }).first();
        await suiteSelectionInput.waitFor({ state: 'visible', timeout: 60000 });
        await this.playwright.click(suiteSelectionInput);
        await suiteSelectionInput.fill(suite);
        await suiteOption.waitFor({ state: 'visible', timeout: 30000 });
        await this.playwright.click(suiteOption);
        await this.playwright.waitForPageLoad();
        await this.playwright.waitForTimeout(20000);
    }
	async selectProductCategory(label: string): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		const categoryTile = innerFrame.locator(`xpath=//a[contains(@aria-labelledby,'v2_productCategory_pL')]//*[text()='${label}']`).filter({ visible: true }).first();
		await this.playwright.click(categoryTile);
		await this.playwright.waitForPageLoad();
	}

	async clickProductName(productGroupName: string): Promise<void> {
		await this.clickProductNameToAdd(productGroupName);
	}

	async clickProductConfig(productConfig: string): Promise<void> {
		 const innerFrame = await this.switchToCanvasInnerFrame();
        await this.playwright.waitForPageLoad();
		const configTab = innerFrame.locator(`xpath=//a[contains(@id,'v2_productCategoryTabs') and @title='${productConfig}']`).filter({ visible: true }).first();
		await this.playwright.waitForPageLoad();
		await this.playwright.click(configTab);
		await this.playwright.waitForPageLoad();
	}

	async selectAddProductsTab(): Promise<void> {
		await this.clickProductConfig('ADD PRODUCTS');
	}

	async selectTab(tabName: string): Promise<void> {
		await this.clickProductConfig(tabName);
	}

	async enterProductFieldText(arrayId: string, fieldId: string, textToBeEntered: string): Promise<void> {
		if (!arrayId || !fieldId) {
			throw new Error(`enterProductFieldText requires both arrayId and fieldId (arrayId="${arrayId}", fieldId="${fieldId}").`);
		}
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		const fieldXpath = `(//*[*[@id='${arrayId}']]//*[contains(@class, 'cpq-table-element')]/*[@role='rowgroup' and contains(@class, 'body')]/*[@role='row']/*[@role='gridcell' and contains(@class, '${fieldId}')])[last()]`;
		const fieldLocator = innerFrame.locator(`xpath=${fieldXpath}`);
		await fieldLocator.waitFor({ state: 'visible', timeout: 60000 });
		await this.playwright.click(fieldLocator);
		await this.playwright.waitForTimeout(2000);
		const editableLocator = fieldLocator.locator('input, textarea, [contenteditable="true"]').first();
		if (await editableLocator.count()) {
			await this.playwright.fill(editableLocator, textToBeEntered);
		} else {
			await this.page.keyboard.press('Control+A');
			await this.page.keyboard.type(textToBeEntered);
		}
		await this.playwright.waitForPageLoad();
	}

	private async selectProductFieldOption(arrayId: string, fieldId: string, optionText: string): Promise<void> {
		if (!arrayId || !fieldId) {
			throw new Error(`selectProductFieldOption requires both arrayId and fieldId (arrayId="${arrayId}", fieldId="${fieldId}").`);
		}
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		const fieldDiv = innerFrame.locator(`xpath=(//*[*[@id='${arrayId}']]//*[contains(@class, 'cpq-table-element')]/*[@role='rowgroup' and contains(@class, 'body')]/*[@role='row']/*[@role='gridcell' and contains(@class, '${fieldId}')])[last()]`);
		await fieldDiv.waitFor({ state: 'visible', timeout: 60000 });

		const currentValue = (await fieldDiv.innerText()).trim();
		if (currentValue.toLowerCase() === optionText.toLowerCase()) {
			return;
		}

		const fieldInput = fieldDiv.locator(`xpath=.//input[contains(@id, '${fieldId}') and not(contains(@style, 'hidden'))]`).last();
		await this.playwright.click(fieldDiv);
		await this.playwright.waitForTimeout(1000);
		await this.playwright.fill(fieldInput, optionText);
		await this.playwright.waitForTimeout(4000);

		let option = innerFrame.locator(`xpath=//*[contains(@id, '${fieldId}')]/li/*[@aria-label='${optionText}']`).filter({ visible: true }).first();
		const foundPrimary = await option.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
		if (!foundPrimary) {
			option = innerFrame.locator(`xpath=//*[contains(@id, '${fieldId}')]//li[*[@aria-label='${optionText}'] or *[@role='gridcell']//*[text()='${optionText}']]`).filter({ visible: true }).first();
		}
		await option.waitFor({ state: 'visible', timeout: 30000 });
		await this.playwright.click(option);
		await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(2000);
	}

	async selectCabinetType(cabinetType: string): Promise<void> {
		await this.selectProductFieldOption(this.CABINET_ARRAY_ID_STR, this.CABINET_TYPE_ID_STR, cabinetType);
	}

	async selectCabinetDimensions(dimensions: string): Promise<void> {
		await this.selectProductFieldOption(this.CABINET_ARRAY_ID_STR, this.CABINET_DIMENSIONS_ID_STR, dimensions);
	}

	async enterNumberOfCabinets(quantity: string): Promise<void> {
		await this.enterProductFieldText(this.CABINET_ARRAY_ID_STR, this.CABINET_QUANTITY_ID_STR, quantity);
	}

	async enterKwPerCabinets(kwPerCabinet: string): Promise<void> {
		await this.enterProductFieldText(this.CABINET_ARRAY_ID_STR, this.CABINET_KW_PER_CABINET_ID_STR, kwPerCabinet);
	}

	async addCabinetDetails(cabinetType: string, dimensions: string, quantity: string): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await innerFrame.locator("xpath=//*[@class='group-title' and text()='Cabinet']").scrollIntoViewIfNeeded();
		await this.selectCabinetType(cabinetType);
		if (['full cabinet', 'half cabinet'].includes(cabinetType.toLowerCase())) {
			await this.selectCabinetDimensions(dimensions);
		}
		await this.enterNumberOfCabinets(quantity);
	}

	async selectCageType(cageType: string): Promise<void> {
		await this.selectProductFieldOption(this.CAGE_ARRAY_ID_STR, this.CAGE_TYPE_ID_STR, cageType);
	}

	async selectCabinetHeight(height: string): Promise<void> {
		await this.selectProductFieldOption(this.CABINET_ARRAY_ID_STR, this.CABINET_HEIGHT_ID_STR, height);
	}

	async selectManufactureAndModel(model: string): Promise<void> {
		await this.selectProductFieldOption(this.CABINET_ARRAY_ID_STR, this.CABINET_MODEL_ID_STR, model);
	}

	async addCabinetDetailsNewConfig(cabinetType: string, quantity: string, kwPerCabinet: string, height: string, model: string): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await innerFrame.locator("xpath=//*[@class='group-title' and text()='Cabinet']").scrollIntoViewIfNeeded();
		await this.selectCabinetType(cabinetType);
		await this.enterNumberOfCabinets(quantity);
		await this.enterKwPerCabinets(kwPerCabinet);
		if (['full cabinet', 'half cabinet'].includes(cabinetType.toLowerCase())) {
			await this.selectCabinetHeight(height);
			await this.selectManufactureAndModel(model);
		}
	}

	async addCageCabinetDetailsNewConfig(cabinetQty: string, cabinetType: string, quantity: string, kwPerCabinet: string, height: string, model: string): Promise<void> {
		await this.selectCageType('Cage');
		await this.enterNumberOfCageCabinets(cabinetQty);
		await this.addCabinetDetailsNewConfig(cabinetType, quantity, kwPerCabinet, height, model);
	}

	async enterCageArea(cageArea: string): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		const cageAreaCell = innerFrame.locator("xpath=(//*[@role='gridcell' and contains(@class, 'cageArea') and not(contains(@class, 'read-only'))])[last()]");
		await cageAreaCell.waitFor({ state: 'visible', timeout: 60000 });
		await this.playwright.click(cageAreaCell);
		const cageAreaInput = innerFrame.locator("xpath=//input[@type='text' and contains(@id, 'cageArea')]").filter({ visible: true }).first();
		await this.playwright.fill(cageAreaInput, cageArea);
		await cageAreaInput.press('Tab');
		await this.playwright.waitForPageLoad();
	}

	async selectCabinetRackSelectionOption(option: string): Promise<void> {
		await this.selectProductFieldOptionNewUI(this.CABINET_RACK_SELECTION_ARRAY_ID_STR, option);
	}

	async addCageDetailsNewUI(cageArea: string, cabinetRackSelection: string, cabinetType: string, dimensions: string, quantity: string): Promise<void> {
		await this.enterCageArea(cageArea);
		await this.selectCabinetRackSelectionOption(cabinetRackSelection);
		await this.addCabinetDetails(cabinetType, dimensions, quantity);
	}

	async addPowerCircuitDetails(voltsPhaseAnB: string, amps: string, quantity: string): Promise<void> {
		await this.selectProductFieldOption(this.POWER_CIRCUIT_ARRAY_ID_STR, this.VOLTS_PHASE_ID_STR, voltsPhaseAnB);
		await this.selectProductFieldOption(this.POWER_CIRCUIT_ARRAY_ID_STR, this.AMPS_ID_STR, amps);
		await this.enterProductFieldText(this.POWER_CIRCUIT_ARRAY_ID_STR, this.POWER_CIRCUIT_QTY_ID_STR, quantity);
	}

	async addPackDetails(packType: string, capacity: string, quantity: string): Promise<void> {
		await this.selectProductFieldOptionNewUI(this.PACK_TYPE_ID_STR, packType);
		if (capacity) {
			await this.selectProductFieldOptionNewUI(this.PACK_CAPACITY_ID_STR, capacity);
		}
		if (quantity) {
			await this.enterProductFieldText(this.PACK_ARRAY_ID_STR, this.PACK_QUANTITY_ID_STR, quantity);
		}
	}

	private async selectProductFieldOptionNewUI(fieldId: string, optionText: string): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		const fieldDiv = innerFrame.locator(`xpath=(//*[contains(@class, '${fieldId}') and not(contains(@class, 'header'))])[last()]`);
		await fieldDiv.waitFor({ state: 'visible', timeout: 60000 });
		await this.playwright.waitForTimeout(2000);
		await this.playwright.click(fieldDiv);
		await this.playwright.waitForTimeout(1000);
		const fieldInput = fieldDiv.locator(`xpath=.//input[@type='text' and not(contains(@style, 'hidden')) and contains(@id, '${fieldId}')]`).last();
		await this.playwright.fill(fieldInput, optionText);
		await this.playwright.waitForTimeout(1000);
		const option = innerFrame.locator(`xpath=//*[contains(@id, '${fieldId}') and @selection-mode='single']//li[*[@role='gridcell']//*[text()='${optionText}']]`).filter({ visible: true }).first();
		await option.waitFor({ state: 'visible', timeout: 30000 });
		await this.playwright.click(option);
		await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(2000);
	}

	async clickUpdateButton(): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		await this.playwright.click(innerFrame.locator("xpath=//*[@name='update' and contains(@class, 'enabled')]/button"));
		await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(5000);
	}

	async clickAddToQuoteButton(): Promise<void> {
		await this.playwright.waitForTimeout(10000);
		await this.selectAddProductsTab();
		await this.playwright.waitForTimeout(2000);
		const innerFrame = await this.switchToCanvasInnerFrame();
		const addToQuoteButton = innerFrame.locator("xpath=//*[@name='_add_to_quote' and contains(@class, 'enabled')]/button");
		const isVisible = await addToQuoteButton.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
		if (!isVisible) {
			await this.selectProductCategory('Space');
			await this.playwright.waitForTimeout(10000);
			await this.selectProductCategory('Power');
			await this.playwright.waitForTimeout(10000);
			await addToQuoteButton.waitFor({ state: 'visible', timeout: 60000 });
		}
		await this.playwright.click(addToQuoteButton);
		await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(5000);
		const stillVisible = await addToQuoteButton.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
		if (stillVisible) {
			await this.playwright.click(addToQuoteButton);
			await this.playwright.waitForPageLoad();
		}
		await this.expandAllQuoteTableLines();
	}

	async expandAllQuoteTableLines(): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		await this.playwright.click(innerFrame.locator("xpath=//cpq-table[@id='lig-table']//button[*[*[text()='View']]]"));
		await this.playwright.waitForTimeout(3000);
		await this.playwright.click(innerFrame.locator("xpath=//a[@role='menuitem'][*[text()='Expand All']]"));
		await this.playwright.waitForPageLoad();
	}

	async productConfigurationForNewCPQ(suiteName: string): Promise<void> {
		const cabinetType = 'Full Cabinet';
		const dimensions = '24 x 36 (in) 45 RU';
		const quantity = '1';
		const voltsPhaseAnB = '208V/1P/(A+B)';
		const amps = '20A';

		await test.step('Product Configuration - Deployment#1 - Started', async () => {
			await this.clickNewDeployment();
			await this.selectSuite(suiteName);

			await this.selectProductCategory('Space');
			await this.clickProductName('Cage');
			await this.playwright.waitForPageLoad();
			await this.playwright.waitForTimeout(2000);

			await this.clickProductName('kW All In');
			await this.playwright.waitForPageLoad();
			await this.playwright.waitForTimeout(2000);

			// await this.selectProductCategory('Power');
			// await this.clickProductName('Power Circuit');
			// await this.playwright.waitForTimeout(10000);
			// await this.clickUpdateButton();

			await this.playwright.waitForPageLoad();
			await this.playwright.waitForTimeout(4000);

			await this.selectTab('SPACE');
			await this.enterNumberOfCabinets("6")
			await this.addCabinetDetails(cabinetType, dimensions, quantity);
			await this.playwright.waitForPageLoad();
			await this.playwright.waitForTimeout(4000);

			// await this.selectTab('POWER');
			// await this.addPowerCircuitDetails(voltsPhaseAnB, amps, quantity);
		});

		await test.step('Product Configuration - Deployment#1 - Completed', async () => {
			await this.clickAddToQuoteButton();
		});

		await test.step('Product Configuration - Deployment#2 - Started', async () => {
			await this.clickNewDeployment();
			await this.selectSuite(suiteName);

			await this.selectProductCategory('Space');
			await this.clickProductName('Cage');
			await this.playwright.waitForPageLoad();
			await this.playwright.waitForTimeout(4000);

			await this.selectProductCategory('Interconnection');
			await this.clickProductName('Standard Pack');
			await this.playwright.waitForPageLoad();
			await this.playwright.waitForTimeout(4000);

			await this.selectTab('SPACE');
			await this.addCageDetailsNewUI('100', 'Cabinets', cabinetType, '24 x 42 (in) 45 RU', quantity);
			await this.playwright.waitForPageLoad();
			await this.playwright.waitForTimeout(4000);

			await this.selectTab('INTERCONNECTION');
			await this.addPackDetails('Fiber', '3 Pack', '2');
		});

		await test.step('Product Configuration - Deployment#2 - Completed', async () => {
			await this.clickAddToQuoteButton();
		});
	}

	private async clickAddButton(arrayId: string): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		await this.playwright.click(innerFrame.locator(`xpath=(//*[*[@id='${arrayId}']]//oj-button[@title='Add'])`).first());
		await this.playwright.waitForTimeout(2000);
	}

	async addSpecificCabinetDetails(prodName: string, cabinetType: string, dimensions: string, quantity: string, kwPerCabinet: string,
		height: string, model: string, cageIdentifier: string, highDensityCabType: string,
		customCabinetLength: string, customCabinetWidth: string, customCabinetHeight: string, cabinetCount: number): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await innerFrame.locator("xpath=//*[@class='group-title' and text()='Cabinet']").scrollIntoViewIfNeeded();
		if (cabinetCount > 1) {
			await this.clickAddButton(this.CABINET_ARRAY_ID_STR);
		}
		await this.selectCabinetType(cabinetType);
		await this.enterNumberOfCabinets(quantity);
		await this.enterKwPerCabinets(kwPerCabinet);
		if (prodName === 'Cabinet') {
			await this.selectProductFieldOption(this.CABINET_ARRAY_ID_STR, this.CAGE_IDENTIFIER_ID_STR, cageIdentifier);
		}
		switch (cabinetType) {
			case 'Custom Cabinet':
			case 'Customer Provided':
				await this.enterProductFieldText(this.CABINET_ARRAY_ID_STR, this.CABINET_CUSTOM_LENGTH_ID_STR, customCabinetLength);
				await this.enterProductFieldText(this.CABINET_ARRAY_ID_STR, this.CABINET_CUSTOM_WIDTH_ID_STR, customCabinetWidth);
				await this.enterProductFieldText(this.CABINET_ARRAY_ID_STR, this.CABINET_CUSTOM_HEIGHT_ID_STR, customCabinetHeight);
				break;
			case 'Full Cabinet':
				await this.selectCabinetHeight(height);
				await this.selectManufactureAndModel(model);
				await this.enterProductFieldText(this.CABINET_ARRAY_ID_STR, this.CABINET_MAX_WEIGHT_ID_STR, '2000');
				break;
			case 'High Density Cabinet':
				await this.selectProductFieldOption(this.CABINET_ARRAY_ID_STR, this.HD_CAGE_CABINET_TYPE_ID_STR, highDensityCabType);
				await this.selectCabinetHeight(height);
				await this.selectManufactureAndModel(model);
				break;
			default:
				break;
		}
	}

	async addSpecificKWAllInDetails(powerType: string, quantity: string, powerCount: number): Promise<void> {
		if (powerCount > 1) {
			await this.clickAddButton(this.KW_ARRAY_ID_STR);
		}
		await this.selectProductFieldOption(this.KW_ARRAY_ID_STR, this.KW_POWER_TYPE_ID_STR, powerType);
		await this.enterProductFieldText(this.KW_ARRAY_ID_STR, this.KW_QUANTITY_ID_STR, quantity);
	}

	async addSpecificPowerCircuitDetails(powerCircuit: string, circuitConfiguration: string, quantity: string): Promise<void> {
		await this.selectProductFieldOption(this.POWER_CIRCUIT_ARRAY_ID_STR, this.POWER_CIRCUIT_ID_STR, powerCircuit);
		await this.selectProductFieldOption(this.POWER_CIRCUIT_ARRAY_ID_STR, this.CIRCUIT_CONFIG_ID_STR, circuitConfiguration);
		await this.enterProductFieldText(this.POWER_CIRCUIT_ARRAY_ID_STR, this.POWER_CIRCUIT_QTY_ID_STR, quantity);
	}

	async addSpecificPrecablingPackDetails(productName: string, preCablingType: string, size: string, quantity: string, precabCount: number): Promise<void> {
		if (precabCount > 1) {
			await this.clickAddButton(this.PACK_ARRAY_ID_STR);
		}
		await this.selectProductFieldOption(this.PACK_ARRAY_ID_STR, this.PRECABLING_PRODUCT_NAME_ID_STR, productName);
		await this.selectProductFieldOption(this.PACK_ARRAY_ID_STR, this.PRECABLING_TYPE_ID_STR, preCablingType);
		await this.selectProductFieldOption(this.PACK_ARRAY_ID_STR, this.PRECABLING_SIZE_ID_STR, size);
		await this.enterProductFieldText(this.PACK_ARRAY_ID_STR, this.PRECABLING_QUANTITY_ID_STR, quantity);
	}

	async productConfigurationForNewLogo(suiteName: string, location: string): Promise<void> {
		const isSYD = location.includes('SYD10') || location.includes('SYD010');
		let height: string;
		let model: string;
		let powerCircuit: string;
		let cageIdentifier: string;
		if (location.includes('PHX10') || location.includes('DFW010')) {
			height = '42U';
			model = 'APC NetShelter AR3100B2 42U 24in x 42in x 79in (WDH)';
			powerCircuit = '20A/120V AC Power Circuit';
			cageIdentifier = '1';
		} else if (isSYD) {
			height = '48U';
			model = 'SRA Solutions 600mm x 1200mm x 2258mm (WDH)';
			powerCircuit = '16A/230V  Power Circuit';
			cageIdentifier = 'None';
		} else {
			throw new Error(`No new logo product configuration is defined for location: ${location}`);
		}

		await test.step('Product Configuration - Deployment#1 - Started', async () => {
			await this.clickNewDeployment();
			await this.selectSuite(suiteName);

			await this.selectProductCategory('Space');
			if (isSYD) {
				await this.clickProductName('Cabinet');
			} else {
				await this.clickProductName('Cage');
			}
			await this.clickProductName('kW All In');

			await this.selectProductCategory('Interconnection');
			await this.clickProductName('IP Bandwidth');
			await this.clickProductName('Precabling');
			await this.playwright.waitForPageLoad();
			await this.playwright.waitForTimeout(4000);

			await this.selectTab('SPACE');
			if (!isSYD) {
				await this.enterNumberOfCageCabinets('1');
			}
			await this.addSpecificCabinetDetails('Cabinet', 'Full Cabinet', '', '1', '20', height, model, cageIdentifier, '', '', '', '', 1);

			await this.addSpecificKWAllInDetails('kW All In', '20', 1);
			await this.addSpecificPowerCircuitDetails(powerCircuit, 'Pair', '1');

			await this.selectTab('INTERCONNECTION');
			await this.addSpecificPrecablingPackDetails('Precabling', 'A-side only model', '24', '1', 1);
		});

		await test.step('Product Configuration - Deployment#1 - Completed', async () => {
			await this.clickAddToQuoteButton();
		});
	}

	private async clickProductNameToAdd(title: string): Promise<void> {
		 const innerFrame = await this.switchToCanvasInnerFrame();
        await this.playwright.waitForPageLoad();
		const link = innerFrame.locator(`xpath=//a[@title='${title}']`).filter({ visible: true }).first();
		await this.playwright.waitForPageLoad();
		await this.playwright.click(link);
		await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(10000);
	}


	//Cage
async enterNumberOfCageCabinets(quantity: string): Promise<void> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		const cabinetsInput = innerFrame.locator("xpath=//input[@id='v2_numberOfCabinets_arr_pL|input']").filter({ visible: true }).first();
		await cabinetsInput.waitFor({ state: 'visible', timeout: 60000 });
		await this.clickNumberOfCabinetsColumnIfPresent();
		await this.playwright.fill(cabinetsInput, quantity);
		await cabinetsInput.press('Tab');
		await this.playwright.waitForPageLoad();
		await this.playwright.waitForTimeout(10000);
	}

	async clickNumberOfCabinetsColumnIfPresent(timeout = 10000): Promise<boolean> {
		const innerFrame = await this.switchToCanvasInnerFrame();
		await this.playwright.waitForPageLoad();
		const cabinetsColumn = innerFrame
			.locator("xpath=//div[contains(@class,'col-v2_numberOfCabinets_arr_pL type-number')]")
			.filter({ visible: true })
			.first();
		const isPresent = await cabinetsColumn
			.waitFor({ state: 'visible', timeout })
			.then(() => true)
			.catch(() => false);
		if (!isPresent) {
			return false;
		}
		await this.playwright.click(cabinetsColumn);
		return true;
	}

}
