// types
import { TGlassCacheEntry, TMaskRenderer } from '../types';

// utils
import { compositeGlassCacheEntry } from '../compositeGlassCacheEntry';

const compositeMaskMock = vi.fn();
const setScissorRectMock = vi.fn();

vi.mock('../../compositeMask', () => ({ compositeMask: (...args: unknown[]): unknown => compositeMaskMock(...args) }));
vi.mock('../setScissorRect', () => ({ setScissorRect: (...args: unknown[]): unknown => setScissorRectMock(...args) }));

const renderer = { context: { devicePixelHeight: 100, devicePixelWidth: 200 }, gl: 'gl' } as unknown as TMaskRenderer;
const entry = {
  height: 20,
  localX: 2,
  localY: 4,
  maskTexture: 'mask',
  rawHeight: 20,
  rawWidth: 40,
  texture: 'tex',
  width: 40,
} as unknown as TGlassCacheEntry;

describe('compositeGlassCacheEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should composite the cached glass inside the rect, scaled from the raw rect it was cached at', () => {
    // mock
    const rect = { height: 10, originX: 10, originY: 20, rawHeight: 10, rawWidth: 20, width: 20, x: 12, y: 22 };

    // before
    compositeGlassCacheEntry(renderer, entry, rect);

    // result
    expect(setScissorRectMock).toHaveBeenNthCalledWith(1, 'gl', rect);
    expect(compositeMaskMock).toHaveBeenCalledWith(renderer.context, 'tex', 'mask', [10, 10, -0.55, -2.2]);
    expect(setScissorRectMock).toHaveBeenLastCalledWith('gl', null);
  });

  it('should fall back to the visible rect when it has no raw size or origin', () => {
    // before
    compositeGlassCacheEntry(renderer, entry, { height: 20, width: 40, x: 0, y: 0 });

    // result
    expect(compositeMaskMock).toHaveBeenCalledWith(renderer.context, 'tex', 'mask', [5, 5, -0.05, -0.2]);
  });
});
