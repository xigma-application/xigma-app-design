// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';

// utils
import { drawSceneBackground } from '../drawSceneBackground';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    COLOR_BUFFER_BIT: 16384,
    clear: vi.fn(),
    clearColor: vi.fn(),
    colorMask: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('drawSceneBackground', () => {
  it('should re-enable alpha writes for the background clear, then lock them for foreground drawing', () => {
    // mock
    const gl = createGlMock();
    const imageContext = { isAlphaWriteEnabled: true } as TImageRenderContext;

    // before
    drawSceneBackground(gl, imageContext);

    // result
    expect((gl.colorMask as ReturnType<typeof vi.fn>).mock.calls).toEqual([
      [true, true, true, true],
      [true, true, true, false],
    ]);
    expect(gl.clear).toHaveBeenCalledTimes(1);
  });

  it('should track that alpha writes are now disabled, for downstream fill draws to read', () => {
    // mock
    const gl = createGlMock();
    const imageContext = { isAlphaWriteEnabled: true } as TImageRenderContext;

    // before
    drawSceneBackground(gl, imageContext);

    // result
    expect(imageContext.isAlphaWriteEnabled).toBe(false);
  });
});
