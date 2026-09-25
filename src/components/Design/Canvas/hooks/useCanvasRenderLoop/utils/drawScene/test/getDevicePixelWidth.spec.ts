// types
import { TDrawSceneContext } from '../types';

// utils
import { getDevicePixelWidth } from '../getDevicePixelWidth';

const gl = { drawingBufferWidth: 400 } as WebGL2RenderingContext;

describe('getDevicePixelWidth', () => {
  it('should prefer the context device width and fall back to the drawing buffer', () => {
    // result
    expect(getDevicePixelWidth({ devicePixelWidth: 160 } as TDrawSceneContext, gl)).toBe(160);
    expect(getDevicePixelWidth({} as TDrawSceneContext, gl)).toBe(400);
  });
});
