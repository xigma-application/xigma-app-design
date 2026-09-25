// types
import { TDrawSceneContext } from '../types';

// utils
import { getDevicePixelHeight } from '../getDevicePixelHeight';

const gl = { drawingBufferHeight: 300 } as WebGL2RenderingContext;

describe('getDevicePixelHeight', () => {
  it('should prefer the context device height and fall back to the drawing buffer', () => {
    // result
    expect(getDevicePixelHeight({ devicePixelHeight: 120 } as TDrawSceneContext, gl)).toBe(120);
    expect(getDevicePixelHeight({} as TDrawSceneContext, gl)).toBe(300);
  });
});
