// others
import { GUIDE_STROKE } from 'constant/canvas';
import { HIGHLIGHT_TEXT_COLOR, RULER_SIZE_PX } from '../../../constants';

// utils
import { paintHighlightedTopTick } from '../paintHighlightedTopTick';

type TFakeGradient = { addColorStop: ReturnType<typeof vi.fn> };

type TFakeContext = {
  beginPath: ReturnType<typeof vi.fn>;
  createLinearGradient: ReturnType<typeof vi.fn<() => TFakeGradient>>;
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string | TFakeGradient;
  fillText: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  measureText: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  strokeStyle: string;
  textAlign: string;
};

const createFakeContext = (): TFakeContext => ({
  beginPath: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  fillRect: vi.fn(),
  fillStyle: '',
  fillText: vi.fn(),
  lineTo: vi.fn(),
  measureText: vi.fn(() => ({ width: 40 })),
  moveTo: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: '',
  textAlign: '',
});

describe('paintHighlightedTopTick', () => {
  it('should paint a shadowed backdrop centred on the tick, reaching past the label by a fixed padding on both sides, with the label offset clear of the line', () => {
    // mock
    const ctx = createFakeContext();

    // action
    paintHighlightedTopTick(ctx as unknown as CanvasRenderingContext2D, { label: '500', screenPos: 500 }, 0);

    // result — half-extent = gap (5) + textWidth (40) + padding (30) = 75, centred on the tick itself
    expect(ctx.createLinearGradient).toHaveBeenCalledWith(500 - 75, 0, 500 + 75, 0);
    expect(ctx.fillRect).toHaveBeenCalledWith(500 - 75, 0, 150, RULER_SIZE_PX);
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
    expect(ctx.measureText).not.toHaveBeenCalled();
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});
