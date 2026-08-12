// utils
import { resizeCanvas } from '../resizeCanvas';

describe('resizeCanvas', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should size the canvas using devicePixelRatio', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 2);

    const canvas = document.createElement('canvas');

    // spy
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 50, width: 100 } as DOMRect);

    // before
    resizeCanvas(canvas);

    // result
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(100);
  });

  it('should fall back to a devicePixelRatio of 1 when unavailable', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 0);

    const canvas = document.createElement('canvas');

    // spy
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 50, width: 100 } as DOMRect);

    // before
    resizeCanvas(canvas);

    // result
    expect(canvas.width).toBe(100);
    expect(canvas.height).toBe(50);
  });

  it('should update the WebGL viewport to match the new size', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 1);

    const canvas = document.createElement('canvas');
    const viewport = vi.fn();

    // spy
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 50, width: 100 } as DOMRect);
    vi.spyOn(canvas, 'getContext').mockReturnValue({ viewport } as unknown as WebGL2RenderingContext);

    // before
    resizeCanvas(canvas);

    // result
    expect(viewport).toHaveBeenCalledWith(0, 0, 100, 50);
  });

  it('should do nothing when the computed size did not change', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 1);

    const canvas = document.createElement('canvas');
    const viewport = vi.fn();

    // spy
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 50, width: 100 } as DOMRect);
    vi.spyOn(canvas, 'getContext').mockReturnValue({ viewport } as unknown as WebGL2RenderingContext);

    // before
    resizeCanvas(canvas);
    viewport.mockClear();

    // action
    resizeCanvas(canvas);

    // result
    expect(viewport).not.toHaveBeenCalled();
  });
});
