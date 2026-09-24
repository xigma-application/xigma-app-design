// utils
import { getEffectTextureCache } from '../getEffectTextureCache';

describe('getEffectTextureCache', () => {
  it('should create an empty cache once per context and reuse it', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;

    // before
    const first = getEffectTextureCache(gl);

    // result
    expect(first).toEqual({ bytes: 0, entries: new Map() });
    expect(getEffectTextureCache(gl)).toBe(first);
  });

  it('should keep separate caches for separate contexts', () => {
    // result
    expect(getEffectTextureCache({} as WebGL2RenderingContext)).not.toBe(getEffectTextureCache({} as WebGL2RenderingContext));
  });
});
