// others
import { RULER_SIZE_PX } from '../../../constants';

// utils
import { paintRulerBackground } from '../paintRulerBackground';

type TFakeContext = {
  clearRect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
};

const createFakeContext = (): TFakeContext => ({ clearRect: vi.fn(), fillRect: vi.fn(), fillStyle: '' });

describe('paintRulerBackground', () => {
  it('should clear the overlay and paint both strips in the given background color', () => {
    // mock
    const ctx = createFakeContext();

    // before
    paintRulerBackground(ctx as unknown as CanvasRenderingContext2D, '#111', 800, 600, 0, 800);

    // result
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.fillStyle).toBe('#111');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, RULER_SIZE_PX);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, RULER_SIZE_PX, 600);
  });

  it('should draw the left strip and corner flush against LeftPanel’s edge, not the true screen edge', () => {
    // mock
    const ctx = createFakeContext();

    // before
    paintRulerBackground(ctx as unknown as CanvasRenderingContext2D, '#111', 800, 600, 300, 800);

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 0, RULER_SIZE_PX, 600);
    expect(ctx.fillRect).toHaveBeenCalledWith(300, 0, 500, RULER_SIZE_PX);
  });

  it('should stop the top strip before RightPanel’s edge instead of running the full width', () => {
    // mock
    const ctx = createFakeContext();

    // before
    paintRulerBackground(ctx as unknown as CanvasRenderingContext2D, '#111', 800, 600, 0, 600);

    // result
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 600, RULER_SIZE_PX);
  });
});
