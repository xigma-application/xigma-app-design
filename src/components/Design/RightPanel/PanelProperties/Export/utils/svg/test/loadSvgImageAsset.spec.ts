// utils
import { loadSvgImageAsset } from '../loadSvgImageAsset';

const bakeSvgImageOrientationMock = vi.fn();
const blobToDataUrlMock = vi.fn();

vi.mock('../bakeSvgImageOrientation', () => ({
  bakeSvgImageOrientation: (...args: unknown[]): unknown => bakeSvgImageOrientationMock(...args),
}));
vi.mock('utils/blobToDataUrl', () => ({ blobToDataUrl: (...args: unknown[]): unknown => blobToDataUrlMock(...args) }));

const sourceBlob = { tag: 'source' } as unknown as Blob;
const bitmap = { height: 200, width: 100 } as unknown as ImageBitmap;

describe('loadSvgImageAsset', () => {
  beforeEach(() => {
    bakeSvgImageOrientationMock.mockReset();
    blobToDataUrlMock.mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (): Promise<{ blob: () => Promise<Blob>; ok: boolean }> => ({ blob: async (): Promise<Blob> => sourceBlob, ok: true })),
    );
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => bitmap),
    );
    blobToDataUrlMock.mockImplementation(async (blob: Blob) => `data:${(blob as unknown as { tag: string }).tag}`);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should embed the fetched bytes verbatim, with the real dimensions, when there is no rotation or flip', async () => {
    // action
    const asset = await loadSvgImageAsset('ref', 0, false, false);

    // result
    expect(fetch).toHaveBeenCalledWith('ref');
    expect(bakeSvgImageOrientationMock).not.toHaveBeenCalled();
    expect(asset).toEqual({ dataUrl: 'data:source', height: 200, width: 100 });
  });

  it('should report width/height swapped when the rotation is sideways (90/270), and bake with the swapped size', async () => {
    // mock
    bakeSvgImageOrientationMock.mockResolvedValue({ tag: 'baked' });

    // action
    const asset = await loadSvgImageAsset('ref', 90, false, false);

    // result
    expect(bakeSvgImageOrientationMock).toHaveBeenCalledWith(bitmap, 90, false, false, 200, 100);
    expect(asset).toEqual({ dataUrl: 'data:baked', height: 100, width: 200 });
  });

  it('should bake when flipped even with a zero rotation', async () => {
    // mock
    bakeSvgImageOrientationMock.mockResolvedValue({ tag: 'baked' });

    // action
    const asset = await loadSvgImageAsset('ref', 0, true, false);

    // result
    expect(bakeSvgImageOrientationMock).toHaveBeenCalledWith(bitmap, 0, true, false, 100, 200);
    expect(asset).toEqual({ dataUrl: 'data:baked', height: 200, width: 100 });
  });

  it('should return null when baking fails', async () => {
    // mock
    bakeSvgImageOrientationMock.mockResolvedValue(null);

    // action
    expect(await loadSvgImageAsset('ref', 180, false, false)).toBeNull();
  });

  it('should return null when the fetch response is not ok', async () => {
    // mock
    vi.stubGlobal(
      'fetch',
      vi.fn(async (): Promise<{ blob: () => Promise<Blob>; ok: boolean }> => ({ blob: async (): Promise<Blob> => sourceBlob, ok: false })),
    );

    // action
    expect(await loadSvgImageAsset('ref', 0, false, false)).toBeNull();
  });

  it('should return null when fetch throws (e.g. a revoked blob URL)', async () => {
    // mock
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network error');
      }),
    );

    // action
    expect(await loadSvgImageAsset('ref', 0, false, false)).toBeNull();
  });
});
