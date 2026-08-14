import { Locator, Page } from '@playwright/test';

export type TToolName =
  | 'comment'
  | 'default'
  | 'ellipse'
  | 'frame'
  | 'hand'
  | 'line'
  | 'media'
  | 'polygon'
  | 'rectangle'
  | 'scale'
  | 'section'
  | 'star'
  | 'text'
  | 'textOnPath';

export class DesignPage {
  readonly page: Page;
  readonly canvas: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvas = page.locator('canvas');
  }

  async goto(projectId: string): Promise<void> {
    await this.page.goto(`/design/${projectId}`);
  }

  toolRadio(tool: TToolName): Locator {
    return this.page.getByRole('radio', { name: tool });
  }

  async selectTool(tool: TToolName): Promise<void> {
    await this.toolRadio(tool).click();
  }

  async selectToolFromDropdown(group: TToolName, label: string): Promise<void> {
    await this.page.getByRole('button', { name: `${group} options` }).click();
    await this.page.getByText(label, { exact: true }).click();
  }

  async drawFrame(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.selectTool('frame');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async drawSection(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.selectToolFromDropdown('frame', 'Section');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async drawRectangle(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.selectTool('rectangle');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async drawEllipse(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.page.keyboard.press('o');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async drawPolygon(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.selectToolFromDropdown('rectangle', 'Polygon');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async drawStar(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.selectToolFromDropdown('rectangle', 'Star');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async drawLine(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.page.keyboard.press('l');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async drawTextBox(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.selectTool('text');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async drawTextOnPath(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.selectToolFromDropdown('text', 'Text on path');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async typeText(content: string): Promise<void> {
    await this.page.keyboard.type(content);
  }

  async pickMediaFile(filePaths: string | string[]): Promise<void> {
    const fileChooserPromise = this.page.waitForEvent('filechooser');

    await this.selectToolFromDropdown('rectangle', 'Image/video...');

    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles(filePaths);

    // the picked file's object URL still has to round-trip through an Image() decode
    // (naturalWidth/naturalHeight) before the tool is actually armed for placement
    await this.page.waitForTimeout(200);
  }

  async placeMediaAtNaturalSize(x: number, y: number): Promise<void> {
    await this.click(x, y);
  }

  async dragMedia(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  async click(x: number, y: number, options: { shift?: boolean } = {}): Promise<void> {
    if (options.shift) {
      await this.page.keyboard.down('Shift');
    }

    await this.page.mouse.click(x, y);

    if (options.shift) {
      await this.page.keyboard.up('Shift');
    }
  }

  async doubleClick(x: number, y: number): Promise<void> {
    await this.page.mouse.dblclick(x, y);
  }

  async pointerDown(x: number, y: number): Promise<void> {
    await this.page.mouse.move(x, y);
    await this.page.mouse.down();
  }

  async pointerMove(x: number, y: number): Promise<void> {
    await this.page.mouse.move(x, y, { steps: 5 });
  }

  async pointerUp(): Promise<void> {
    await this.page.mouse.up();
  }

  async panBy(dx: number, dy: number): Promise<void> {
    const startX = 500;
    const startY = 500;

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down({ button: 'middle' });
    await this.page.mouse.move(startX + dx, startY + dy, { steps: 5 });
    await this.page.mouse.up({ button: 'middle' });
  }

  async zoomAt(x: number, y: number, deltaY: number): Promise<void> {
    await this.page.mouse.move(x, y);
    await this.page.keyboard.down('Control');
    await this.page.mouse.wheel(0, deltaY);
    await this.page.keyboard.up('Control');
  }

  async cursorStyle(): Promise<string> {
    return this.canvas.evaluate((el) => (el as HTMLCanvasElement).style.cursor);
  }
}
