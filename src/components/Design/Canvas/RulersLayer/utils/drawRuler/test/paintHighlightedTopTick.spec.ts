// others
import { GUIDE_STROKE } from 'constant/canvas';
import { HIGHLIGHT_TEXT_COLOR, RULER_SIZE_PX } from '../../../constants';

// utils
import { paintHighlightedTopTick } from '../paintHighlightedTopTick';

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  fillText: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  strokeStyle: string;
  textAlign: string;
};

const createFakeContext = (): TFakeContext => ({
  beginPath: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
  fillText: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  textAlign: '',
});

describe('paintHighlightedTopTick', () => {
  it('should draw the guide line through the strip and the value beside it, with no backdrop', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintHighlightedTopTick(ctx as unknown as CanvasRenderingContext2D, { label: '500', screenPos: 500 }, 0);

    // result
    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(ctx.strokeStyle).toBe(GUIDE_STROKE);
    expect(ctx.moveTo).toHaveBeenCalledWith(500, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(500, RULER_SIZE_PX);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fillStyle).toBe(HIGHLIGHT_TEXT_COLOR);
    expect(ctx.textAlign).toBe('left');
    expect(ctx.fillText).toHaveBeenCalledWith('500', 505, RULER_SIZE_PX / 2);
  });

  it('should draw nothing while the tick sits behind the left strip', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintHighlightedTopTick(ctx as unknown as CanvasRenderingContext2D, { label: '10', screenPos: 10 }, 300);

    // result
    expect(ctx.stroke).not.toHaveBeenCalled();
    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});
