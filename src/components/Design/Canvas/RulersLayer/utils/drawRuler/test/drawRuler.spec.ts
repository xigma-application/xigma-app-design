// others
import { RULER_SIZE_PX } from '../../../constants';

// utils
import { drawRuler } from '../drawRuler';

const paintTopTickMock = vi.fn();
const paintLeftTickMock = vi.fn();
const paintHighlightedTopTickMock = vi.fn();
const paintHighlightedLeftTickMock = vi.fn();

vi.mock('../paintTopTick', () => ({ paintTopTick: (...args: unknown[]): void => paintTopTickMock(...args) }));
vi.mock('../paintLeftTick', () => ({ paintLeftTick: (...args: unknown[]): void => paintLeftTickMock(...args) }));
vi.mock('../paintHighlightedTopTick', () => ({
  paintHighlightedTopTick: (...args: unknown[]): void => paintHighlightedTopTickMock(...args),
}));
vi.mock('../paintHighlightedLeftTick', () => ({
  paintHighlightedLeftTick: (...args: unknown[]): void => paintHighlightedLeftTickMock(...args),
}));

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

describe('drawRuler', () => {
  beforeEach(() => {
    paintTopTickMock.mockClear();
    paintLeftTickMock.mockClear();
    paintHighlightedTopTickMock.mockClear();
    paintHighlightedLeftTickMock.mockClear();
  });

  it('should clear the overlay and paint the top strip, left strip, and every tick', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      highlightedGuide: null,
      leftInset: 0,
      rightInset: 0,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, RULER_SIZE_PX);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, RULER_SIZE_PX, 600);
    expect(paintTopTickMock).toHaveBeenCalled();
    expect(paintLeftTickMock).toHaveBeenCalled();
    expect(paintHighlightedTopTickMock).not.toHaveBeenCalled();
    expect(paintHighlightedLeftTickMock).not.toHaveBeenCalled();
  });

  it('should draw the left strip and corner flush against LeftPanel’s edge, not the true screen edge', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      highlightedGuide: null,
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
      highlightedGuide: null,
      leftInset: 0,
      rightInset: 200,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 600, RULER_SIZE_PX);
  });

  it('should paint the highlighted x-axis guide value via paintHighlightedTopTick', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      highlightedGuide: { axis: 'x', worldPosition: 500 },
      leftInset: 0,
      rightInset: 0,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(paintHighlightedTopTickMock).toHaveBeenCalledWith(ctx, { label: '500', screenPos: 500 }, 0);
    expect(paintHighlightedLeftTickMock).not.toHaveBeenCalled();
  });

  it('should paint the highlighted y-axis guide value via paintHighlightedLeftTick', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      highlightedGuide: { axis: 'y', worldPosition: 300 },
      leftInset: 0,
      rightInset: 0,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(paintHighlightedLeftTickMock).toHaveBeenCalledWith(ctx, { label: '300', screenPos: 300 }, 0);
    expect(paintHighlightedTopTickMock).not.toHaveBeenCalled();
  });

  it('should never call a highlight painter when there is nothing to highlight', () => {
    // mock
    const ctx = createFakeContext();

    // action
    drawRuler(ctx as unknown as CanvasRenderingContext2D, {
      height: 600,
      highlightedGuide: null,
      leftInset: 0,
      rightInset: 0,
      viewport: { x: 0, y: 0, zoom: 1 },
      width: 800,
    });

    // result
    expect(paintHighlightedTopTickMock).not.toHaveBeenCalled();
    expect(paintHighlightedLeftTickMock).not.toHaveBeenCalled();
  });
});
