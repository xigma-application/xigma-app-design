// others
import { RULER_SIZE_PX } from '../../constants';

// utils
import { drawRuler } from '../drawRuler';

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  fillText: ReturnType<typeof vi.fn>;
  font: string;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  strokeStyle: string;
  textAlign: string;
  textBaseline: string;
  translate: ReturnType<typeof vi.fn>;
};

const createFakeContext = (): TFakeContext => ({
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
  fillText: vi.fn(),
  font: '',
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  textAlign: '',
  textBaseline: '',
  translate: vi.fn(),
});

describe('drawRuler', () => {
  it('should clear the overlay and paint the top strip, left strip, and tick labels', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      leftInset: 0,
      rightInset: 0,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, RULER_SIZE_PX);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, RULER_SIZE_PX, 600);
    expect(ctx.fillText).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('should rotate the left-strip labels so they read vertically', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      leftInset: 0,
      rightInset: 0,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.rotate).toHaveBeenCalledWith(-Math.PI / 2);
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should not draw a top tick that falls behind the left strip', () => {
    // mock — pan so the world-0 tick lands at screenPos 10, inside the 20px left gutter
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 400,
      leftInset: 0,
      rightInset: 0,
      viewport: { x: 10, y: 0, zoom: 1 },
      width: 800,
    });

    // result — every vertical tick stroke starts at x >= RULER_SIZE_PX
    const topTickMoves = ctx.moveTo.mock.calls.filter(([, y]) => y === RULER_SIZE_PX);
    expect(topTickMoves.length).toBeGreaterThan(0);
    topTickMoves.forEach(([x]) => expect(x).toBeGreaterThanOrEqual(RULER_SIZE_PX));
  });

  it('should draw the left strip and corner flush against LeftPanel’s edge, not the true screen edge', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      leftInset: 300,
      rightInset: 0,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 0, RULER_SIZE_PX, 600);
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 0, 500, RULER_SIZE_PX);
  });

  it('should stop the top strip before RightPanel’s edge instead of running the full width', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      leftInset: 0,
      rightInset: 200,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 600, RULER_SIZE_PX);
  });

  it('should not draw a top tick that falls under LeftPanel', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 400,
      leftInset: 300,
      rightInset: 0,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    const topTickMoves = ctx.moveTo.mock.calls.filter(([, y]) => y === RULER_SIZE_PX);
    expect(topTickMoves.length).toBeGreaterThan(0);
    topTickMoves.forEach(([x]) => expect(x).toBeGreaterThanOrEqual(300 + RULER_SIZE_PX));
  });

  it('should draw the left-strip ticks flush against the panel edge, not the true left edge', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 400,
      leftInset: 300,
      rightInset: 0,
      viewport: { x: 0, y: 100, zoom: 1 },
      width: 800,
    });

    // result
    const leftTickMoves = ctx.moveTo.mock.calls.filter(([x]) => x === 300 + RULER_SIZE_PX);
    expect(leftTickMoves.length).toBeGreaterThan(0);
  });
});
