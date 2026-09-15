// utils
import { createImageDataUrlFromPixels } from '../createImageDataUrlFromPixels';

describe('createImageDataUrlFromPixels', () => {
  beforeEach(() => {
    // jsdom has no native ImageData constructor without the optional `canvas` package
    vi.stubGlobal(
      'ImageData',
      vi.fn(function FakeImageData(data: Uint8ClampedArray, width: number, height: number) {
        return { data, height, width };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should return null when a 2D context is unavailable', () => {
    // mock — jsdom doesn't implement CanvasRenderingContext2D without the optional `canvas` package (already stubbed to null in test setup)
    // action
    const result = createImageDataUrlFromPixels(new Uint8Array([255, 0, 0, 255]), 1, 1);

    // result
    expect(result).toBeNull();
  });

  it('should draw the flipped pixels onto a canvas of the given size and return its data URL', () => {
    // mock
    const putImageData = vi.fn();

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ putImageData } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,abc');

    // before — a single row, so flipping is a no-op and the pixels pass through unchanged
    const pixels = new Uint8Array([1, 2, 3, 4]);

    // action
    const result = createImageDataUrlFromPixels(pixels, 1, 1);

    // result
    expect(putImageData).toHaveBeenCalledTimes(1);

    const [imageData, x, y] = putImageData.mock.calls[0] as [ImageData, number, number];

    expect(imageData.width).toBe(1);
    expect(imageData.height).toBe(1);
    expect(Array.from(imageData.data)).toEqual([1, 2, 3, 4]);
    expect(x).toBe(0);
    expect(y).toBe(0);
    expect(result).toBe('data:image/png;base64,abc');
  });
});
