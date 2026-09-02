// others
import { RULER_SIZE_PX } from '../../../constants';

// utils
import { paintTopBand } from '../paintTopBand';

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

describe('paintTopBand', () => {
  it('should fill the strip between the band edges', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintTopBand(ctx as unknown as CanvasRenderingContext2D, band(100, 300), 0, 800);

    // result
    expect(ctx.fillStyle).toBe('rgba(0, 0, 0, 0.2)');
    expect(ctx.fillRect).toHaveBeenCalledWith(100, 0, 200, RULER_SIZE_PX);
  });

  it('should clamp the band to the drawable strip between the left inset and the right edge', () => {
    // mock
    const ctx = createFakeContext();

    // action — band runs from behind the left strip to past the right edge
    paintTopBand(ctx as unknown as CanvasRenderingContext2D, band(-50, 2000), 300, 700);

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(300 + RULER_SIZE_PX, 0, 700 - (300 + RULER_SIZE_PX), RULER_SIZE_PX);
  });

  it('should draw nothing when the band is fully outside the drawable strip', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintTopBand(ctx as unknown as CanvasRenderingContext2D, band(-100, -10), 0, 800);

    // result
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});
