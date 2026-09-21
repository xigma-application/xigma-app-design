// utils
import { createImageBlobFromPixels } from '../createImageBlobFromPixels';

describe('createImageBlobFromPixels', () => {
  beforeEach(() => {
    // jsdom has no native ImageData constructor without the optional `canvas` package
    vi.stubGlobal(
      'ImageData',
      vi.fn(function FakeImageData(data: Uint8ClampedArray, width: number, height: number, settings?: ImageDataSettings) {
        return { data, height, settings, width };
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should resolve null when a 2D context is unavailable', async () => {
    // action
    const result = await createImageBlobFromPixels(new Uint8Array([255, 0, 0, 255]), 1, 1, 'image/png');

    // result
    expect(result).toBeNull();
  });

  it('should draw the flipped pixels onto a canvas of the given size and resolve its blob at the given mime type and quality', async () => {
    // mock
    const putImageData = vi.fn();
    const getContext = vi.fn().mockReturnValue({ putImageData });
    const blob = { size: 4, type: 'image/jpeg' } as Blob;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(getContext);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(blob));

    // before — a single row, so flipping is a no-op and the pixels pass through unchanged
    const pixels = new Uint8Array([1, 2, 3, 4]);

    // action
    const result = await createImageBlobFromPixels(pixels, 1, 1, 'image/jpeg', 0.8);

    // result — defaults to a plain sRGB canvas when no color profile is given
    expect(getContext).toHaveBeenCalledWith('2d', { colorSpace: 'srgb' });
    expect(putImageData).toHaveBeenCalledTimes(1);

    const [imageData, x, y] = putImageData.mock.calls[0] as [ImageData & { settings?: ImageDataSettings }, number, number];

    expect(imageData.width).toBe(1);
    expect(imageData.height).toBe(1);
    expect(Array.from(imageData.data)).toEqual([1, 2, 3, 4]);
    expect(imageData.settings).toEqual({ colorSpace: 'srgb' });
    expect(x).toBe(0);
    expect(y).toBe(0);
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8);
    expect(result).toBe(blob);
  });

  it('should draw onto a Display P3 canvas and tag the pixel data as Display P3 when that color profile is requested', async () => {
    // mock
    const putImageData = vi.fn();
    const getContext = vi.fn().mockReturnValue({ putImageData });
    const blob = { size: 4, type: 'image/png' } as Blob;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(getContext);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(blob));

    // action
    await createImageBlobFromPixels(new Uint8Array([1, 2, 3, 4]), 1, 1, 'image/png', undefined, 'displayP3');

    // result
    expect(getContext).toHaveBeenCalledWith('2d', { colorSpace: 'display-p3' });

    const [imageData] = putImageData.mock.calls[0] as [ImageData & { settings?: ImageDataSettings }];

    expect(imageData.settings).toEqual({ colorSpace: 'display-p3' });
  });
});
