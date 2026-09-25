// others
import { WEBGL_CONTEXT_ATTRIBUTES, WEBGL_CONTEXT_ID } from '../../../../constants';

// utils
import { getCachedGlContext } from '../getCachedGlContext';

const cacheProgramLocationsMock = vi.fn();
const cacheGlStateMock = vi.fn();

vi.mock('../cacheProgramLocations', () => ({ cacheProgramLocations: (...args: unknown[]): unknown => cacheProgramLocationsMock(...args) }));
vi.mock('../cacheGlState/cacheGlState', () => ({ cacheGlState: (...args: unknown[]): unknown => cacheGlStateMock(...args) }));

describe('getCachedGlContext', () => {
  it('should create the WebGL context and install the location and state caches on it', () => {
    // mock
    const gl = {};
    const canvas = { getContext: vi.fn(() => gl) } as unknown as HTMLCanvasElement;

    // result
    expect(getCachedGlContext(canvas)).toBe(gl);
    expect(canvas.getContext).toHaveBeenCalledWith(WEBGL_CONTEXT_ID, WEBGL_CONTEXT_ATTRIBUTES);
    expect(cacheProgramLocationsMock).toHaveBeenCalledWith(gl);
    expect(cacheGlStateMock).toHaveBeenCalledWith(gl);
  });

  it('should return nothing without a canvas or a context', () => {
    // mock
    cacheProgramLocationsMock.mockClear();

    // result
    expect(getCachedGlContext(null)).toBeUndefined();
    expect(getCachedGlContext({ getContext: (): null => null } as unknown as HTMLCanvasElement)).toBeNull();
    expect(cacheProgramLocationsMock).not.toHaveBeenCalled();
  });
});
