// types
import { TMaskRenderer } from '../types';

// utils
import { captureBackdropTexture } from '../captureBackdropTexture';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    FRAMEBUFFER: 36160,
    FRAMEBUFFER_BINDING: 36006,
    RGBA: 6408,
    TEXTURE_2D: 3553,
    bindFramebuffer: vi.fn(),
    bindTexture: vi.fn(),
    copyTexImage2D: vi.fn(),
    copyTexSubImage2D: vi.fn(),
    drawingBufferHeight: 480,
    drawingBufferWidth: 640,
    getParameter: vi.fn(() => ({ tag: 'currently-bound-framebuffer' })),
  }) as unknown as WebGL2RenderingContext;

describe('captureBackdropTexture', () => {
  it('should copy the currently bound framebuffer into a pooled texture sized to the drawing buffer', () => {
    // mock
    const gl = createGlMock();
    const backdrop = { texture: { tag: 'backdrop' } } as unknown as ReturnType<TMaskRenderer['pool']['acquire']>;
    const pool = { acquire: vi.fn(() => backdrop) } as unknown as TMaskRenderer['pool'];
    const renderer = { context: {}, gl, pool } as unknown as TMaskRenderer;

    // action
    const result = captureBackdropTexture(renderer);

    // result
    expect(pool.acquire).toHaveBeenCalledTimes(1);
    expect(gl.bindTexture).toHaveBeenCalledWith(gl.TEXTURE_2D, backdrop.texture);
    expect(gl.copyTexImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, 640, 480, 0);
    expect(gl.bindTexture).toHaveBeenLastCalledWith(gl.TEXTURE_2D, null);
    expect(result).toBe(backdrop);
  });

  it('should copy only the given rect when one is passed', () => {
    // mock
    const gl = createGlMock();
    const backdrop = { texture: { tag: 'backdrop' } } as unknown as ReturnType<TMaskRenderer['pool']['acquire']>;
    const pool = { acquire: vi.fn(() => backdrop) } as unknown as TMaskRenderer['pool'];
    const renderer = { context: {}, gl, pool } as unknown as TMaskRenderer;

    // action
    captureBackdropTexture(renderer, { height: 40, width: 30, x: 10, y: 20 });

    // result
    expect(gl.copyTexSubImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, 10, 20, 10, 20, 30, 40);
    expect(gl.copyTexImage2D).not.toHaveBeenCalled();
  });

  it('should re-bind the framebuffer that was current before pool.acquire(), since acquiring a freshly-created (uncached) target leaves the FRAMEBUFFER binding at null as its own internal side effect — without this, the copy would read from the default/on-screen framebuffer instead of the real source', () => {
    // mock — simulate pool.acquire() internally calling createTarget(), which (as its own
    // documented behaviour) unbinds back to the default framebuffer once it's done configuring
    // the freshly-created texture/renderbuffer
    const gl = createGlMock();
    const previousFramebuffer = { tag: 'export-target-fbo' };

    (gl.getParameter as ReturnType<typeof vi.fn>).mockReturnValue(previousFramebuffer);

    const backdrop = { texture: { tag: 'backdrop' } } as unknown as ReturnType<TMaskRenderer['pool']['acquire']>;
    const pool = {
      acquire: vi.fn(() => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return backdrop;
      }),
    } as unknown as TMaskRenderer['pool'];
    const renderer = { context: {}, gl, pool } as unknown as TMaskRenderer;

    // action
    captureBackdropTexture(renderer, { height: 40, width: 30, x: 10, y: 20 });

    // result — the framebuffer that was bound before pool.acquire() ran is restored before the
    // copy call, so copyTexSubImage2D reads from the real source, not the default framebuffer
    const bindFramebufferCalls = (gl.bindFramebuffer as ReturnType<typeof vi.fn>).mock.calls;
    const restoreCallIndex = bindFramebufferCalls.findIndex((call) => call[1] === previousFramebuffer);
    const copyCallOrder = (gl.copyTexSubImage2D as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const restoreCallOrder = (gl.bindFramebuffer as ReturnType<typeof vi.fn>).mock.invocationCallOrder[restoreCallIndex];

    expect(restoreCallIndex).toBeGreaterThanOrEqual(0);
    expect(restoreCallOrder).toBeLessThan(copyCallOrder);
  });
});
