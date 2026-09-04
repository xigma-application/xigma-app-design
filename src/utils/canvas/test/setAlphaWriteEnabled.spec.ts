// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';

// utils
import { setAlphaWriteEnabled } from '../setAlphaWriteEnabled';

const createGlMock = (): WebGL2RenderingContext => ({ colorMask: vi.fn() }) as unknown as WebGL2RenderingContext;

describe('setAlphaWriteEnabled', () => {
  it('should set the colorMask alpha bit and the tracked flag together, when enabling', () => {
    // mock
    const gl = createGlMock();
    const imageContext = { isAlphaWriteEnabled: false } as TImageRenderContext;

    // before
    setAlphaWriteEnabled(gl, imageContext, true);

    // result
    expect(gl.colorMask).toHaveBeenCalledWith(true, true, true, true);
    expect(imageContext.isAlphaWriteEnabled).toBe(true);
  });

  it('should set the colorMask alpha bit and the tracked flag together, when disabling', () => {
    // mock
    const gl = createGlMock();
    const imageContext = { isAlphaWriteEnabled: true } as TImageRenderContext;

    // before
    setAlphaWriteEnabled(gl, imageContext, false);

    // result
    expect(gl.colorMask).toHaveBeenCalledWith(true, true, true, false);
    expect(imageContext.isAlphaWriteEnabled).toBe(false);
  });
});
