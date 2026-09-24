// types
import { TGlassCacheEntry, TMaskRenderer } from '../types';

// utils
import { glassCaches } from '../glassCaches';
import { refreshGlassCacheEntry } from '../refreshGlassCacheEntry';

const isGlassRectAffectedMock = vi.fn();

vi.mock('../isGlassRectAffected', () => ({ isGlassRectAffected: (...args: unknown[]): unknown => isGlassRectAffectedMock(...args) }));

const gl = { tag: 'gl' } as unknown as WebGL2RenderingContext;
const renderer = { gl } as unknown as TMaskRenderer;
const RECT = { height: 10, width: 10, x: 0, y: 0 };
const OLD_STATE = { a: { id: 'a' } };
const NEW_STATE = { a: { id: 'a' }, b: { id: 'b' } };

const cacheEntry = (): TGlassCacheEntry => {
  const entry = { nodesState: OLD_STATE } as unknown as TGlassCacheEntry;

  glassCaches.set(gl, new Map([['glass', entry]]));

  return entry;
};

describe('refreshGlassCacheEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    glassCaches.delete(gl);
  });

  it('should do nothing without a cached entry', () => {
    // before
    refreshGlassCacheEntry(renderer, 'glass', NEW_STATE, RECT);

    // result
    expect(isGlassRectAffectedMock).not.toHaveBeenCalled();
  });

  it('should keep an entry that is already current without comparing anything', () => {
    // mock
    const entry = cacheEntry();

    // before
    refreshGlassCacheEntry(renderer, 'glass', OLD_STATE, RECT);

    // result
    expect(isGlassRectAffectedMock).not.toHaveBeenCalled();
    expect(entry.nodesState).toBe(OLD_STATE);
  });

  it('should adopt the new nodes state when the changes do not touch the glass rect', () => {
    // mock
    const entry = cacheEntry();

    isGlassRectAffectedMock.mockReturnValue(false);

    // before
    refreshGlassCacheEntry(renderer, 'glass', NEW_STATE, RECT);

    // result
    expect(entry.nodesState).toBe(NEW_STATE);
    expect(isGlassRectAffectedMock).toHaveBeenCalledWith(renderer, 'glass', RECT, expect.objectContaining({ all: false }));
  });

  it('should leave the entry stale when a change touches the glass rect', () => {
    // mock
    const entry = cacheEntry();

    isGlassRectAffectedMock.mockReturnValue(true);

    // before
    refreshGlassCacheEntry(renderer, 'glass', NEW_STATE, RECT);

    // result
    expect(entry.nodesState).toBe(OLD_STATE);
  });

  it('should look the entry up under a separate cache key while checking the real node id', () => {
    // mock
    const entry = { nodesState: OLD_STATE } as unknown as TGlassCacheEntry;

    glassCaches.set(gl, new Map([['glass:extra', entry]]));
    isGlassRectAffectedMock.mockReturnValue(false);

    // before
    refreshGlassCacheEntry(renderer, 'glass', NEW_STATE, RECT, 'glass:extra');

    // result
    expect(entry.nodesState).toBe(NEW_STATE);
    expect(isGlassRectAffectedMock).toHaveBeenCalledWith(renderer, 'glass', RECT, expect.any(Object));
  });
});
