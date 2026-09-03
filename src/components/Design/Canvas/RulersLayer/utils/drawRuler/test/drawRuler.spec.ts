// others
import { RULER_BACKGROUND } from 'constant/canvas';

// types
import type { TRulerTick } from '../../getRulerTicks';

// utils
import { drawRuler, type TDrawRulerParams } from '../drawRuler';

const paintRulerBackgroundMock = vi.fn();
const paintTopTicksMock = vi.fn();
const paintLeftTicksMock = vi.fn();
const paintHighlightedTopTickMock = vi.fn();
const paintHighlightedLeftTickMock = vi.fn();
const paintTopBandMock = vi.fn();
const paintLeftBandMock = vi.fn();
const paintTopBandEdgesMock = vi.fn();
const paintLeftBandEdgesMock = vi.fn();

vi.mock('../paintRulerBackground', () => ({ paintRulerBackground: (...args: unknown[]): void => paintRulerBackgroundMock(...args) }));
vi.mock('../paintTopTicks', () => ({ paintTopTicks: (...args: unknown[]): void => paintTopTicksMock(...args) }));
vi.mock('../paintLeftTicks', () => ({ paintLeftTicks: (...args: unknown[]): void => paintLeftTicksMock(...args) }));
vi.mock('../paintHighlightedTopTick', () => ({
  paintHighlightedTopTick: (...args: unknown[]): void => paintHighlightedTopTickMock(...args),
}));
vi.mock('../paintHighlightedLeftTick', () => ({
  paintHighlightedLeftTick: (...args: unknown[]): void => paintHighlightedLeftTickMock(...args),
}));
vi.mock('../paintTopBand', () => ({ paintTopBand: (...args: unknown[]): void => paintTopBandMock(...args) }));
vi.mock('../paintLeftBand', () => ({ paintLeftBand: (...args: unknown[]): void => paintLeftBandMock(...args) }));
vi.mock('../paintTopBandEdges', () => ({ paintTopBandEdges: (...args: unknown[]): void => paintTopBandEdgesMock(...args) }));
vi.mock('../paintLeftBandEdges', () => ({ paintLeftBandEdges: (...args: unknown[]): void => paintLeftBandEdgesMock(...args) }));

type TFakeContext = {
  fillStyle: string;
  font: string;
  globalAlpha: number;
  strokeStyle: string;
  textAlign: string;
  textBaseline: string;
};

const createFakeContext = (): TFakeContext => ({
  fillStyle: '',
  font: '',
  globalAlpha: 1,
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
    paintRulerBackgroundMock.mockReset();
    paintTopTicksMock.mockReset();
    paintLeftTicksMock.mockReset();
    paintHighlightedTopTickMock.mockReset();
    paintHighlightedLeftTickMock.mockReset();
    paintTopBandMock.mockReset();
    paintLeftBandMock.mockReset();
    paintTopBandEdgesMock.mockReset();
    paintLeftBandEdgesMock.mockReset();
  });

  it('should paint the background and every tick, but skip bands and highlights when idle', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params());

    // result
    expect(paintRulerBackgroundMock).toHaveBeenCalledWith(ctx, RULER_BACKGROUND, 800, 600, 0, 800);
    expect(paintTopTicksMock).toHaveBeenCalled();
    expect(paintLeftTicksMock).toHaveBeenCalled();
    expect(paintTopBandMock).not.toHaveBeenCalled();
    expect(paintLeftBandMock).not.toHaveBeenCalled();
    expect(paintHighlightedTopTickMock).not.toHaveBeenCalled();
    expect(paintHighlightedLeftTickMock).not.toHaveBeenCalled();
  });

  it('should shift the background flush against LeftPanel’s edge, not the true screen edge', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ leftInset: 300 }));

    // result
    expect(paintRulerBackgroundMock).toHaveBeenCalledWith(ctx, RULER_BACKGROUND, 800, 600, 300, 800);
  });

  it('should stop the background before RightPanel’s edge instead of running the full width', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ rightInset: 200 }));

    // result
    expect(paintRulerBackgroundMock).toHaveBeenCalledWith(ctx, RULER_BACKGROUND, 800, 600, 0, 600);
  });

  it('should paint a selection band on both rulers when one is supplied, without edge markers', () => {
    // mock
    const ctx = createFakeContext();
    const topBand = { edges: null, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 100, toPx: 300 };
    const leftBand = { edges: null, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 40, toPx: 120 };

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ leftBand, topBand }));

    // result
    expect(paintTopBandMock).toHaveBeenCalledWith(ctx, topBand, 0, 800);
    expect(paintLeftBandMock).toHaveBeenCalledWith(ctx, leftBand, 0, 600);
    expect(paintTopBandEdgesMock).not.toHaveBeenCalled();
    expect(paintLeftBandEdgesMock).not.toHaveBeenCalled();
  });

  it('should mark the frame extent edges after the ticks when the band carries edge labels', () => {
    // mock
    const ctx = createFakeContext();
    const topBand = { edges: { fromLabel: '0', toLabel: '9735' }, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 100, toPx: 300 };
    const leftBand = { edges: { fromLabel: '0', toLabel: '2356' }, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 40, toPx: 120 };

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ leftBand, topBand }));

    // result — no highlighted guide, so no proximity screenPos, step 100
    expect(paintTopBandEdgesMock).toHaveBeenCalledWith(ctx, topBand, 0, 800, null, 100);
    expect(paintLeftBandEdgesMock).toHaveBeenCalledWith(ctx, leftBand, 0, 600, null, 100);
  });

  it('should pass the highlighted guide position to the edge painters so they can hide behind it', () => {
    // mock
    const ctx = createFakeContext();
    const topBand = { edges: { fromLabel: '0', toLabel: '9735' }, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 100, toPx: 300 };

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ highlightedGuide: { axis: 'x', worldPosition: 250 }, topBand }));

    // result — guide value screenPos is 250 (origin 0, zoom 1)
    expect(paintTopBandEdgesMock).toHaveBeenCalledWith(ctx, topBand, 0, 800, 250, 100);
  });

  it('should pass the band, highlighted guide tick, and styling through to the tick painters', () => {
    // mock
    const ctx = createFakeContext();
    const topBand = { edges: null, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 100, toPx: 300 };
    const leftBand = { edges: null, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 40, toPx: 120 };

    // action
    drawRuler(
      ctx as unknown as CanvasRenderingContext2D,
      params({
        frameExtentTickFill: 'var(--in-band)',
        leftBand,
        leftInset: 50,
        textFill: 'var(--text)',
        topBand,
      }),
    );

    // result
    expect(paintTopTicksMock).toHaveBeenCalledWith(ctx, expect.any(Array), topBand, null, 50, 100, 'var(--text)', 'var(--in-band)');
    expect(paintLeftTicksMock).toHaveBeenCalledWith(ctx, expect.any(Array), leftBand, null, 50, 100, 'var(--text)', 'var(--in-band)');
  });

  it('should rebase the tick labels to the given origin', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ origin: { x: 200, y: 100 } }));

    // result — the tick at the origin reads "0" once rebased
    const topTicks = paintTopTicksMock.mock.calls[0]?.[1] as TRulerTick[];
    const leftTicks = paintLeftTicksMock.mock.calls[0]?.[1] as TRulerTick[];

    expect(topTicks).toContainEqual({ label: '0', screenPos: 200 });
    expect(leftTicks).toContainEqual({ label: '0', screenPos: 100 });
  });

  it('should rebase the highlighted x-axis guide value to the origin too, and forward it to the top tick painter', () => {
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
    expect(paintTopTicksMock).toHaveBeenCalledWith(
      ctx,
      expect.any(Array),
      null,
      { label: '300', screenPos: 500 },
      0,
      100,
      expect.any(String),
      expect.any(String),
    );
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

  it('should paint the background in the given color and set the given tick stroke, instead of the defaults', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ background: 'var(--bg)', tickStroke: 'var(--stroke)' }));

    // result
    expect(paintRulerBackgroundMock).toHaveBeenCalledWith(ctx, 'var(--bg)', 800, 600, 0, 800);
    expect(ctx.strokeStyle).toBe('var(--stroke)');
  });
});
