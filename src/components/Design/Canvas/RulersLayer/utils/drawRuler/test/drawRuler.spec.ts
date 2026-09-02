// others
import { RULER_FRAME_EXTENT_TICK_FILL, RULER_TEXT_FILL } from 'constant/canvas';
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
const paintTopBandEdgesMock = vi.fn();
const paintLeftBandEdgesMock = vi.fn();

vi.mock('../paintTopBand', () => ({ paintTopBand: (...args: unknown[]): void => paintTopBandMock(...args) }));
vi.mock('../paintLeftBand', () => ({ paintLeftBand: (...args: unknown[]): void => paintLeftBandMock(...args) }));
vi.mock('../paintTopBandEdges', () => ({ paintTopBandEdges: (...args: unknown[]): void => paintTopBandEdgesMock(...args) }));
vi.mock('../paintLeftBandEdges', () => ({ paintLeftBandEdges: (...args: unknown[]): void => paintLeftBandEdgesMock(...args) }));

type TFakeContext = {
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  font: string;
  globalAlpha: number;
  strokeStyle: string;
  textAlign: string;
  textBaseline: string;
};

const createFakeContext = (): TFakeContext => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
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
    paintTopTickMock.mockReset();
    paintLeftTickMock.mockReset();
    paintHighlightedTopTickMock.mockReset();
    paintHighlightedLeftTickMock.mockReset();
    paintTopBandMock.mockReset();
    paintLeftBandMock.mockReset();
    paintTopBandEdgesMock.mockReset();
    paintLeftBandEdgesMock.mockReset();
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

  it('should mute mid-band labels, drop the ones on the edges, and ramp alpha on both sides of each edge', () => {
    // mock — origin 0, step 100 → ticks at screenPos 0,100,…,1200; band edges at 400 and 800
    const ctx = createFakeContext();
    const drawnAt: Array<{ alpha: number; fill: string; screenPos: number }> = [];

    paintTopTickMock.mockImplementation((_ctx, tick) =>
      drawnAt.push({ alpha: ctx.globalAlpha, fill: ctx.fillStyle, screenPos: tick.screenPos }),
    );
    const topBand = { edges: { fromLabel: '0', toLabel: '388' }, fill: '#333954', fromPx: 400, toPx: 800 };

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ topBand, width: 1200 }));

    // result
    const drawnPositions = drawnAt.map((entry) => entry.screenPos);
    const at = (screenPos: number): { alpha: number; fill: string } | undefined => drawnAt.find((entry) => entry.screenPos === screenPos);

    expect(drawnPositions).not.toContain(400); // on the left edge — dropped
    expect(drawnPositions).not.toContain(800); // on the right edge — dropped
    expect(at(600)).toMatchObject({ alpha: 1, fill: RULER_FRAME_EXTENT_TICK_FILL }); // mid-band, muted
    expect(at(0)).toMatchObject({ alpha: 1, fill: RULER_TEXT_FILL }); // far outside
    expect(at(300)!.alpha).toBeGreaterThan(0); // approaching the left edge from outside
    expect(at(300)!.alpha).toBeLessThan(1);
    expect(at(300)!.fill).toBe(RULER_TEXT_FILL);
    expect(at(900)!.alpha).toBeLessThan(1); // approaching the right edge from outside
    expect(ctx.globalAlpha).toBe(1); // reset once the ticks are done
  });

  it('should also skip the left-ruler tick that lands on a frame band edge', () => {
    // mock — left ticks at screenPos 0,100,…,600; band edge at 200
    const ctx = createFakeContext();
    const drawnPositions: number[] = [];

    paintLeftTickMock.mockImplementation((_ctx, tick) => drawnPositions.push(tick.screenPos));
    const leftBand = { edges: { fromLabel: '0', toLabel: '150' }, fill: '#333954', fromPx: 200, toPx: 400 };

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ leftBand }));

    // result
    expect(drawnPositions).not.toContain(200);
    expect(drawnPositions).toContain(100);
  });

  it('should keep the regular tick label colour under a plain selection band (no edges)', () => {
    // mock
    const ctx = createFakeContext();
    const fillAtTick: string[] = [];

    paintTopTickMock.mockImplementation(() => fillAtTick.push(ctx.fillStyle));
    const topBand = { edges: null, fill: 'rgba(0, 0, 0, 0.2)', fromPx: 100, toPx: 700 };

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ topBand }));

    // result
    expect(fillAtTick.every((fill) => fill === RULER_TEXT_FILL)).toBe(true);
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

  it('should fade the scale labels around the highlighted guide value and drop the one it lands on', () => {
    // mock — origin 0, step 100 → ticks at screenPos 0,100,…,800; guide value sits at screenPos 500
    const ctx = createFakeContext();
    const drawnAt: Array<{ alpha: number; screenPos: number }> = [];

    paintTopTickMock.mockImplementation((_ctx, tick) => drawnAt.push({ alpha: ctx.globalAlpha, screenPos: tick.screenPos }));

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, params({ highlightedGuide: { axis: 'x', worldPosition: 500 } }));

    // result
    const drawnPositions = drawnAt.map((entry) => entry.screenPos);

    expect(drawnPositions).not.toContain(500); // the tick under the guide value — dropped
    expect(drawnAt.find((entry) => entry.screenPos === 400)!.alpha).toBeLessThan(1); // one step away — fading
    expect(drawnAt.find((entry) => entry.screenPos === 200)!.alpha).toBe(1); // far enough — untouched
    expect(ctx.globalAlpha).toBe(1); // reset once the ticks are done
  });
});
