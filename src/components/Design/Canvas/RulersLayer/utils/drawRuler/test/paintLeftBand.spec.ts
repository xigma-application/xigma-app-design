// others
import { RULER_SIZE_PX } from '../../../constants';

// utils
import { paintLeftBand } from '../paintLeftBand';

type TFakeContext = {
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
};

const createFakeContext = (): TFakeContext => ({ fillRect: vi.fn(), fillStyle: '' });

const band = (fromPx: number, toPx: number): { edges: null; fill: string; fromPx: number; toPx: number } => ({
  edges: null,
  fill: 'rgba(0, 0, 0, 0.2)',
  fromPx,
  toPx,
});

describe('paintLeftBand', () => {
  it('should fill the strip between the band edges, anchored at the left inset', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftBand(ctx as unknown as CanvasRenderingContext2D, band(40, 120), 300, 600);

    // result
    expect(ctx.fillStyle).toBe('rgba(0, 0, 0, 0.2)');
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 40, RULER_SIZE_PX, 80);
  });

  it('should clamp the band to the drawable strip between the top strip and the ruler height', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftBand(ctx as unknown as CanvasRenderingContext2D, band(-50, 2000), 0, 500);

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(0, RULER_SIZE_PX, RULER_SIZE_PX, 500 - RULER_SIZE_PX);
  });

  it('should draw nothing when the band is fully above the top strip', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftBand(ctx as unknown as CanvasRenderingContext2D, band(-100, -10), 0, 600);

    // result
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});
