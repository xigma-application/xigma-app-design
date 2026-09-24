// types
import { TTrackedGlState } from '../types';

// utils
import { trackFramebuffer } from '../trackFramebuffer';

const createGl = (): {
  gl: WebGL2RenderingContext;
  native: { bindFramebuffer: ReturnType<typeof vi.fn>; deleteFramebuffer: ReturnType<typeof vi.fn> };
} => {
  const native = { bindFramebuffer: vi.fn(), deleteFramebuffer: vi.fn() };

  return {
    gl: { DRAW_FRAMEBUFFER: 36009, FRAMEBUFFER: 36160, READ_FRAMEBUFFER: 36008, ...native } as unknown as WebGL2RenderingContext,
    native,
  };
};

const createState = (): TTrackedGlState => ({ blend: [0, 0, 0, 0], framebuffer: null, viewport: [0, 0, 0, 0] });

describe('trackFramebuffer', () => {
  it.each([
    ['framebuffer', 36160],
    ['draw framebuffer', 36009],
  ])('should record a bind to the %s target and still bind it', (_, target) => {
    // mock
    const { gl, native } = createGl();
    const state = createState();
    const framebuffer = {} as WebGLFramebuffer;

    trackFramebuffer(gl, state);

    // before
    gl.bindFramebuffer(target, framebuffer);

    // result
    expect(native.bindFramebuffer).toHaveBeenCalledWith(target, framebuffer);
    expect(state.framebuffer).toBe(framebuffer);
  });

  it('should ignore a bind to the read framebuffer target', () => {
    // mock
    const { gl } = createGl();
    const state = createState();

    trackFramebuffer(gl, state);

    // before
    gl.bindFramebuffer(36008, {} as WebGLFramebuffer);

    // result
    expect(state.framebuffer).toBeNull();
  });

  it('should fall back to the default framebuffer when the bound one is deleted', () => {
    // mock
    const { gl, native } = createGl();
    const state = createState();
    const framebuffer = {} as WebGLFramebuffer;

    trackFramebuffer(gl, state);
    gl.bindFramebuffer(36160, framebuffer);

    // before
    gl.deleteFramebuffer(framebuffer);

    // result
    expect(native.deleteFramebuffer).toHaveBeenCalledWith(framebuffer);
    expect(state.framebuffer).toBeNull();
  });

  it('should keep the binding when another framebuffer is deleted', () => {
    // mock
    const { gl } = createGl();
    const state = createState();
    const framebuffer = {} as WebGLFramebuffer;

    trackFramebuffer(gl, state);
    gl.bindFramebuffer(36160, framebuffer);

    // before
    gl.deleteFramebuffer({} as WebGLFramebuffer);

    // result
    expect(state.framebuffer).toBe(framebuffer);
  });
});
