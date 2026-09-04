// others
import { RULER_SIZE_PX } from '../../../constants';

// utils
import { paintRulerCorner } from '../paintRulerCorner';

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
};

const createFakeContext = (): TFakeContext => ({ beginPath: vi.fn(), lineTo: vi.fn(), moveTo: vi.fn(), stroke: vi.fn() });

describe('paintRulerCorner', () => {
  it('should stroke an L-shaped border along the bottom and right edges of the corner square', () => {
    // mock
    const ctx = createFakeContext();

    // before
    paintRulerCorner(ctx as unknown as CanvasRenderingContext2D, 0);

    // result
    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledWith(0, RULER_SIZE_PX + 0.5);
    expect(ctx.lineTo).toHaveBeenNthCalledWith(1, RULER_SIZE_PX + 0.5, RULER_SIZE_PX + 0.5);
    expect(ctx.lineTo).toHaveBeenNthCalledWith(2, RULER_SIZE_PX + 0.5, 0);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });

  it('should shift the corner along with the given left inset', () => {
    // mock
    const ctx = createFakeContext();

    // before
    paintRulerCorner(ctx as unknown as CanvasRenderingContext2D, 300);

    // result
    expect(ctx.moveTo).toHaveBeenCalledWith(300, RULER_SIZE_PX + 0.5);
    expect(ctx.lineTo).toHaveBeenNthCalledWith(1, 300 + RULER_SIZE_PX + 0.5, RULER_SIZE_PX + 0.5);
    expect(ctx.lineTo).toHaveBeenNthCalledWith(2, 300 + RULER_SIZE_PX + 0.5, 0);
  });
});
