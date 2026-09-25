// utils
import { loadBrushAlpha } from '../loadBrushAlpha';

describe('loadBrushAlpha', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ blob: async (): Promise<Blob> => new Blob() })),
    );
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({ height: 1, width: 2 })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should read the alpha channel of the brush image as 0-1 values', async () => {
    // mock
    const drawImage = vi.fn();
    const getImageData = vi.fn(() => ({ data: new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 51]) }));

    // spy
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage, getImageData } as unknown as CanvasRenderingContext2D);

    // before
    const alpha = await loadBrushAlpha('/brush.png');

    // result
    expect(fetch).toHaveBeenCalledWith('/brush.png');
    expect(alpha?.width).toBe(2);
    expect(alpha?.height).toBe(1);
    expect(alpha?.data[0]).toBe(1);
    expect(alpha?.data[1]).toBeCloseTo(0.2);
  });

  it('should return nothing when no 2D context is available', async () => {
    // spy
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    // result
    expect(await loadBrushAlpha('/brush.png')).toBeNull();
  });
});
