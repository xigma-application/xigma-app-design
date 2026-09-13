// types
import { TMaskRenderer } from '../types';

// utils
import { captureBackdropTexture } from '../captureBackdropTexture';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    RGBA: 6408,
    TEXTURE_2D: 3553,
    bindTexture: vi.fn(),
    copyTexImage2D: vi.fn(),
    drawingBufferHeight: 480,
    drawingBufferWidth: 640,
  }) as unknown as WebGL2RenderingContext;

describe('captureBackdropTexture', () => {
  it('should copy the currently bound framebuffer into a pooled texture sized to the drawing buffer', () => {
    // mock
    const gl = createGlMock();
    const backdrop = { texture: { tag: 'backdrop' } } as unknown as ReturnType<TMaskRenderer['pool']['acquire']>;
    const pool = { acquire: vi.fn(() => backdrop) } as unknown as TMaskRenderer['pool'];
    const renderer = { gl, pool } as unknown as TMaskRenderer;

    // action
    const result = captureBackdropTexture(renderer);

    // result
    expect(pool.acquire).toHaveBeenCalledTimes(1);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, backdrop.texture);
    expect(gl.copyTexImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, 640, 480, 0);
    expect(gl.bindTexture).toHaveBeenLastCalledWith(gl.TEXTURE_2D, null);
    expect(result).toBe(backdrop);
  });
});
