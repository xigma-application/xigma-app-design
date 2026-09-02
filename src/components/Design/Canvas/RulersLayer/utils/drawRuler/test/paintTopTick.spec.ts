// others
import { RULER_SIZE_PX, RULER_TICK_LENGTH_PX } from '../../../constants';

// utils
import { paintTopTick } from '../paintTopTick';

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
};

const createFakeContext = (): TFakeContext => ({
  beginPath: vi.fn(),
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  stroke: vi.fn(),
});

describe('paintTopTick', () => {
  it('should stroke a crisp tick mark and print its label', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintTopTick(ctx as unknown as CanvasRenderingContext2D, { label: '100', screenPos: 100 }, 0);

    // result
    expect(ctx.moveTo).toHaveBeenCalledWith(100.5, RULER_SIZE_PX);
    expect(ctx.lineTo).toHaveBeenCalledWith(100.5, RULER_SIZE_PX - RULER_TICK_LENGTH_PX);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith('100', 100, RULER_SIZE_PX / 2);
  });

  it('should draw nothing when the tick falls behind the left strip', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintTopTick(ctx as unknown as CanvasRenderingContext2D, { label: '5', screenPos: 5 }, 0);

    // result
    expect(ctx.moveTo).not.toHaveBeenCalled();
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('should measure clearance against a non-zero left inset', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintTopTick(ctx as unknown as CanvasRenderingContext2D, { label: '320', screenPos: 320 }, 300);

    // result
    expect(ctx.moveTo).toHaveBeenCalledWith(320.5, RULER_SIZE_PX);
  });
});
