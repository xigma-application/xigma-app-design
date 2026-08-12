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

    // before
    drawSceneBackground(gl);

    // result
    expect((gl.colorMask as ReturnType<typeof vi.fn>).mock.calls).toEqual([
      [true, true, true, true],
      [true, true, true, false],
    ]);
    expect(gl.clear).toHaveBeenCalledTimes(1);
  });
});
