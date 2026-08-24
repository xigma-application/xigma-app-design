import { Locator, Page } from '@playwright/test';

// LeftPanel/RightPanel are opaque, full-height overlays that sit on top of the canvas (which itself
// still spans the full viewport underneath them) — any click/drag whose x falls inside either panel's
// width lands on the panel instead of the canvas. These match the panels' own fixed widths.
const LEFT_PANEL_WIDTH = 500;
const RIGHT_PANEL_WIDTH = 240;

export type TToolName =
  | 'arrow'
  | 'comment'
  | 'default'
  | 'ellipse'
  | 'frame'
  | 'hand'
  | 'line'
  | 'media'
  | 'pen'
  | 'pencil'
  | 'polygon'
  | 'rectangle'
  | 'scale'
  | 'section'
  | 'slice'
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

  // the canvas element itself still reports the full, unclipped viewport as its bounding box, even
  // though LeftPanel/RightPanel now visually and interactively cover part of it — this returns the
  // inset region that is actually real, clickable canvas, so fraction-based test coordinates
  // (box.x + box.width * 0.5, etc.) keep landing on the canvas instead of a panel.
  async canvasSafeArea(): Promise<{ x: number; y: number; width: number; height: number }> {
    const box = await this.canvas.boundingBox();

    if (!box) {
      throw new Error('Canvas bounding box unavailable');
    }

    return {
      height: box.height,
      width: box.width - LEFT_PANEL_WIDTH - RIGHT_PANEL_WIDTH,
      x: box.x + LEFT_PANEL_WIDTH,
      y: box.y,
    };
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

  // VectorEditToolbar's own Move button (ToolName.move) — distinct from the main toolbar's
  // default/Move slot (ToolName.default): clicking it switches away from Pen without leaving
  // Vector Edit Mode, unlike selectTool('default') on the main toolbar (selectToolbarTool.ts).
  async selectVectorEditMoveTool(): Promise<void> {
    await this.page.getByRole('button', { exact: true, name: 'Move' }).click();
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

  async drawSlice(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.selectToolFromDropdown('frame', 'Slice');
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

  // clicks each point in turn with the Pen tool active — every click places (or re-visits) a
  // straight-segment vertex, so this covers any plain-click vector path, including closing a loop
  // by passing the first point's coordinates again as the last entry
  async drawVectorPath(points: { x: number; y: number }[]): Promise<void> {
    await this.selectTool('pen');

    for (const point of points) {
      await this.click(point.x, point.y);
    }
  }

  // a click-drag from one screen point to another, with no tool selection of its own — reused both
  // for placing a curved (tangent-handle) vertex mid-draw and for dragging an existing vertex/handle
  // once in vector edit mode, since both are the same down-move-up primitive at the app level
  async dragVectorPoint(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
  }

  // same down-move-up primitive as dragVectorPoint, with Control held for the whole gesture — used to
  // arm/continue a Ctrl+drag bend on a straight vector segment
  async ctrlDragVectorPoint(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.page.keyboard.down('Control');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
    await this.page.keyboard.up('Control');
  }

  // same down-move-up primitive as dragVectorPoint, with Shift held for the whole gesture — used to
  // hard-constrain a vector segment/tangent drag to the nearest 15deg increment
  async shiftDragVectorPoint(x1: number, y1: number, x2: number, y2: number): Promise<void> {
    await this.page.keyboard.down('Shift');
    await this.pointerDown(x1, y1);
    await this.page.mouse.move(x2, y2, { steps: 5 });
    await this.pointerUp();
    await this.page.keyboard.up('Shift');
  }

  // a free-hand multi-point drag (Lasso tool) — down at the first point, through every intermediate
  // point in order, up at the last; unlike dragVectorPoint's single interpolated straight line, the
  // actual drawn shape is the polyline connecting these points
  async dragVectorLasso(points: { x: number; y: number }[]): Promise<void> {
    const [first, ...rest] = points;

    await this.pointerDown(first.x, first.y);

    for (const point of rest) {
      await this.pointerMove(point.x, point.y);
    }

    await this.pointerUp();
  }

  // same down/move.../up primitive as dragVectorLasso, kept as its own named method since it's a
  // semantically distinct tool (Shape Builder's freeform sweep, not a selection lasso)
  async dragVectorShapeBuilder(points: { x: number; y: number }[]): Promise<void> {
    const [first, ...rest] = points;

    await this.pointerDown(first.x, first.y);

    for (const point of rest) {
      await this.pointerMove(point.x, point.y);
    }

    await this.pointerUp();
  }

  // same primitive, with Alt held for the whole gesture — Shape Builder's subtract mode
  async altDragVectorShapeBuilder(points: { x: number; y: number }[]): Promise<void> {
    await this.page.keyboard.down('Alt');
    await this.dragVectorShapeBuilder(points);
    await this.page.keyboard.up('Alt');
  }

  // same down/move.../up primitive as dragVectorLasso, for the Pencil tool's own freehand drag — one
  // continuous gesture commits exactly one vector node, unlike Pen's click-by-click chaining
  async drawPencilStroke(points: { x: number; y: number }[]): Promise<void> {
    const [first, ...rest] = points;

    await this.pointerDown(first.x, first.y);

    for (const point of rest) {
      await this.pointerMove(point.x, point.y);
    }

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

  async click(x: number, y: number, options: { alt?: boolean; ctrl?: boolean; shift?: boolean } = {}): Promise<void> {
    if (options.shift) {
      await this.page.keyboard.down('Shift');
    }

    if (options.ctrl) {
      await this.page.keyboard.down('Control');
    }

    if (options.alt) {
      await this.page.keyboard.down('Alt');
    }

    await this.page.mouse.click(x, y);

    if (options.shift) {
      await this.page.keyboard.up('Shift');
    }

    if (options.ctrl) {
      await this.page.keyboard.up('Control');
    }

    if (options.alt) {
      await this.page.keyboard.up('Alt');
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
    // clear of both the LeftPanel (0-500) and RightPanel (viewport-width-240 .. viewport-width)
    // overlays, with room either side for the largest dx/dy any caller currently passes
    const startX = 1100;
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

  async cursorClassName(): Promise<string> {
    return this.canvas.evaluate((el) => el.className);
  }
}
