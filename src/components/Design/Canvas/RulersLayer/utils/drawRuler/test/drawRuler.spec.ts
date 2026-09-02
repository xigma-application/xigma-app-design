// others
import { RULER_SIZE_PX } from '../../../constants';

// utils
import { drawRuler, type TDrawRulerParams } from '../drawRuler';

const paintTopTickMock = vi.fn();
const paintLeftTickMock = vi.fn();
const paintHighlightedTopTickMock = vi.fn();
const paintHighlightedLeftTickMock = vi.fn();
const paintTopBandMock = vi.fn();
const paintLeftBandMock = vi.fn();

vi.mock('../paintTopTick', () => ({ paintTopTick: (...args: unknown[]): void => paintTopTickMock(...args) }));
vi.mock('../paintLeftTick', () => ({ paintLeftTick: (...args: unknown[]): void => paintLeftTickMock(...args) }));
vi.mock('../paintHighlightedTopTick', () => ({
  paintHighlightedTopTick: (...args: unknown[]): void => paintHighlightedTopTickMock(...args),
}));
vi.mock('../paintHighlightedLeftTick', () => ({
  paintHighlightedLeftTick: (...args: unknown[]): void => paintHighlightedLeftTickMock(...args),
}));
vi.mock('../paintTopBand', () => ({ paintTopBand: (...args: unknown[]): void => paintTopBandMock(...args) }));
vi.mock('../paintLeftBand', () => ({ paintLeftBand: (...args: unknown[]): void => paintLeftBandMock(...args) }));

type TFakeContext = {
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  font: string;
  strokeStyle: string;
  textAlign: string;
  textBaseline: string;
};

const createFakeContext = (): TFakeContext => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
  font: '',
  strokeStyle: '',
  textAlign: '',
  textBaseline: '',
});

const params = (overrides: Partial<TDrawRulerParams> = {}): TDrawRulerParams => ({
  height: 600,
  highlightedGuide: null,
  leftBand: null,
  leftInset: 0,
  origin: { x: 0, y: 0 },
  rightInset: 0,
  topBand: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  width: 800,
  ...overrides,
});

describe('drawRuler', () => {
  beforeEach(() => {
    paintTopTickMock.mockClear();
    paintLeftTickMock.mockClear();
    paintHighlightedTopTickMock.mockClear();
    paintHighlightedLeftTickMock.mockClear();
    paintTopBandMock.mockClear();
    paintLeftBandMock.mockClear();
  });

  it('should clear the overlay and paint the top strip, left strip, and every tick', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params());

    // result
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, RULER_SIZE_PX);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, RULER_SIZE_PX, 600);
    expect(paintTopTickMock).toHaveBeenCalled();
    expect(paintLeftTickMock).toHaveBeenCalled();
    expect(paintTopBandMock).not.toHaveBeenCalled();
    expect(paintLeftBandMock).not.toHaveBeenCalled();
    expect(paintHighlightedTopTickMock).not.toHaveBeenCalled();
    expect(paintHighlightedLeftTickMock).not.toHaveBeenCalled();
  });

  it('should draw the left strip and corner flush against LeftPanel’s edge, not the true screen edge', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ leftInset: 300 }));

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 0, RULER_SIZE_PX, 600);
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 0, 500, RULER_SIZE_PX);
  });

  it('should stop the top strip before RightPanel’s edge instead of running the full width', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ rightInset: 200 }));

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 600, RULER_SIZE_PX);
  });

  it('should paint a selection band on both rulers when one is supplied, before the ticks', () => {
    // mock
    const ctx = createFakeContext();
    const topBand = { fill: 'rgba(0, 0, 0, 0.2)', fromPx: 100, toPx: 300 };
    const leftBand = { fill: 'rgba(0, 0, 0, 0.2)', fromPx: 40, toPx: 120 };

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ leftBand, topBand }));

    // result
    expect(paintTopBandMock).toHaveBeenCalledWith(ctx, topBand, 0, 800);
    expect(paintLeftBandMock).toHaveBeenCalledWith(ctx, leftBand, 0, 600);
  });

  it('should rebase the tick labels to the given origin', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ origin: { x: 200, y: 100 } }));

    // result — the tick at the origin reads "0" once rebased
    expect(paintTopTickMock).toHaveBeenCalledWith(ctx, { label: '0', screenPos: 200 }, 0);
    expect(paintLeftTickMock).toHaveBeenCalledWith(ctx, { label: '0', screenPos: 100 }, 0);
  });

  it('should rebase the highlighted x-axis guide value to the origin too', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(
      ctx as unknown as CanvasRenderingContext2D,
      params({ highlightedGuide: { axis: 'x', worldPosition: 500 }, origin: { x: 200, y: 0 } }),
    );

    // result
    expect(paintHighlightedTopTickMock).toHaveBeenCalledWith(ctx, { label: '300', screenPos: 500 }, 0);
    expect(paintHighlightedLeftTickMock).not.toHaveBeenCalled();
  });

  it('should paint the highlighted y-axis guide value via paintHighlightedLeftTick', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ highlightedGuide: { axis: 'y', worldPosition: 300 } }));

    // result
    expect(paintHighlightedLeftTickMock).toHaveBeenCalledWith(ctx, { label: '300', screenPos: 300 }, 0);
    expect(paintHighlightedTopTickMock).not.toHaveBeenCalled();
  });

  it('should never call a highlight painter when there is nothing to highlight', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params());

    // result
    expect(paintHighlightedTopTickMock).not.toHaveBeenCalled();
    expect(paintHighlightedLeftTickMock).not.toHaveBeenCalled();
  });
});
