// utils
import { sizeRulerCanvas } from '../sizeRulerCanvas';

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height, width } as DOMRect);

  return canvas;
};

describe('sizeRulerCanvas', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should size the backing store to the CSS box times the device pixel ratio', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 2);

    const canvas = createCanvas(200, 100);

    // action
    sizeRulerCanvas(canvas);

    // result
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(200);
  });

  it('should fall back to a ratio of 1 when devicePixelRatio is unset', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 0);

    const canvas = createCanvas(120, 60);

    // action
    sizeRulerCanvas(canvas);

    // result
    expect(canvas.width).toBe(120);
    expect(canvas.height).toBe(60);
  });

  it('should leave the backing store untouched when it already matches', () => {
    // mock
    vi.stubGlobal('devicePixelRatio', 1);

    const canvas = createCanvas(80, 40);
    sizeRulerCanvas(canvas);

    // spy
    const widthSetter = vi.spyOn(canvas, 'width', 'set');

    // action
    sizeRulerCanvas(canvas);

    // result
    expect(widthSetter).not.toHaveBeenCalled();
  });
});
