// others
import { GUIDE_STROKE } from 'constant/canvas';
import { HIGHLIGHT_TEXT_COLOR, RULER_SIZE_PX } from '../../../constants';

// utils
import { paintHighlightedLeftTick } from '../paintHighlightedLeftTick';

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  fillText: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  strokeStyle: string;
  textAlign: string;
  translate: ReturnType<typeof vi.fn>;
};

const createFakeContext = (): TFakeContext => ({
  beginPath: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  restore: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  textAlign: '',
  translate: vi.fn(),
});

describe('paintHighlightedLeftTick', () => {
  it('should draw the guide line through the strip and the rotated value beside it, with no backdrop', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintHighlightedLeftTick(ctx as unknown as CanvasRenderingContext2D, { label: '300', screenPos: 300 }, 0);

    // result
    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe(GUIDE_STROKE);
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 300);
    expect(ctx.lineTo).toHaveBeenCalledWith(RULER_SIZE_PX, 300);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fillStyle).toBe(HIGHLIGHT_TEXT_COLOR);
    expect(ctx.textAlign).toBe('left');
    expect(ctx.translate).toHaveBeenCalledWith(RULER_SIZE_PX / 2, 300);
    expect(ctx.rotate).toHaveBeenCalledWith(-Math.PI / 2);
    expect(ctx.fillText).toHaveBeenCalledWith('300', 5, 0);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should draw nothing while the tick sits above the top strip', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintHighlightedLeftTick(ctx as unknown as CanvasRenderingContext2D, { label: '5', screenPos: 5 }, 0);

    // result
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});
