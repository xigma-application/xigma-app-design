// others
import { RULER_SIZE_PX, RULER_TICK_LENGTH_PX } from '../../../constants';

// utils
import { paintLeftTick } from '../paintLeftTick';

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
};

const createFakeContext = (): TFakeContext => ({
  beginPath: vi.fn(),
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
});

describe('paintLeftTick', () => {
  it('should stroke a crisp tick mark and print its label rotated to read vertically', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftTick(ctx as unknown as CanvasRenderingContext2D, { label: '100', screenPos: 100 }, 0);

    // result
    expect(ctx.moveTo).toHaveBeenCalledWith(RULER_SIZE_PX, 100.5);
    expect(ctx.lineTo).toHaveBeenCalledWith(RULER_SIZE_PX - RULER_TICK_LENGTH_PX, 100.5);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalledWith(RULER_SIZE_PX / 2, 100);
    expect(ctx.rotate).toHaveBeenCalledWith(-Math.PI / 2);
    expect(ctx.fillText).toHaveBeenCalledWith('100', 0, 0);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should draw nothing when the tick falls behind the top strip', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftTick(ctx as unknown as CanvasRenderingContext2D, { label: '5', screenPos: 5 }, 0);

    // result
    expect(ctx.moveTo).not.toHaveBeenCalled();
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('should offset the strip and label by a non-zero left inset', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintLeftTick(ctx as unknown as CanvasRenderingContext2D, { label: '100', screenPos: 100 }, 300);

    // result
    expect(ctx.moveTo).toHaveBeenCalledWith(300 + RULER_SIZE_PX, 100.5);
    expect(ctx.translate).toHaveBeenCalledWith(300 + RULER_SIZE_PX / 2, 100);
  });
});
