// utils
import { cacheGlState } from '../cacheGlState';

const FRAMEBUFFER = 36160;
const DRAW_FRAMEBUFFER = 36009;
const READ_FRAMEBUFFER = 36008;
const FRAMEBUFFER_BINDING = 36006;
const VIEWPORT = 2978;
const BLEND_SRC_RGB = 32969;
const BLEND_DST_RGB = 32968;
const BLEND_SRC_ALPHA = 32971;
const BLEND_DST_ALPHA = 32970;
const ONE = 1;
const SRC_ALPHA = 770;
const ONE_MINUS_SRC_ALPHA = 771;
const MAX_TEXTURE_SIZE = 3379;

type TGlMock = {
  gl: WebGL2RenderingContext;
  native: {
    bindFramebuffer: ReturnType<typeof vi.fn>;
    blendFunc: ReturnType<typeof vi.fn>;
    blendFuncSeparate: ReturnType<typeof vi.fn>;
    deleteFramebuffer: ReturnType<typeof vi.fn>;
    getParameter: ReturnType<typeof vi.fn>;
    viewport: ReturnType<typeof vi.fn>;
  };
};

const createGl = (): TGlMock => {
  const native = {
    bindFramebuffer: vi.fn(),
    blendFunc: vi.fn(),
    blendFuncSeparate: vi.fn(),
    deleteFramebuffer: vi.fn(),
    getParameter: vi.fn((parameter: number) => {
      const values: Record<number, unknown> = {
        [BLEND_DST_ALPHA]: ONE_MINUS_SRC_ALPHA,
        [BLEND_DST_RGB]: ONE_MINUS_SRC_ALPHA,
        [BLEND_SRC_ALPHA]: SRC_ALPHA,
        [BLEND_SRC_RGB]: SRC_ALPHA,
        [FRAMEBUFFER_BINDING]: null,
        [MAX_TEXTURE_SIZE]: 4096,
        [VIEWPORT]: new Int32Array([0, 0, 800, 600]),
      };

      return values[parameter];
    }),
    viewport: vi.fn(),
  };
  const gl = {
    BLEND_DST_ALPHA,
    BLEND_DST_RGB,
    BLEND_SRC_ALPHA,
    BLEND_SRC_RGB,
    DRAW_FRAMEBUFFER,
    FRAMEBUFFER,
    FRAMEBUFFER_BINDING,
    VIEWPORT,
    ...native,
  } as unknown as WebGL2RenderingContext;

  return { gl, native };
};

describe('cacheGlState', () => {
  it('should serve the initial framebuffer, viewport and blend function without querying the driver again', () => {
    // mock
    const { gl, native } = createGl();

    // before
    cacheGlState(gl);
    native.getParameter.mockClear();

    // result
    expect(gl.getParameter(FRAMEBUFFER_BINDING)).toBeNull();
    expect(Array.from(gl.getParameter(VIEWPORT) as Int32Array)).toEqual([0, 0, 800, 600]);
    expect(gl.getParameter(BLEND_SRC_RGB)).toBe(SRC_ALPHA);
    expect(gl.getParameter(BLEND_DST_RGB)).toBe(ONE_MINUS_SRC_ALPHA);
    expect(gl.getParameter(BLEND_SRC_ALPHA)).toBe(SRC_ALPHA);
    expect(gl.getParameter(BLEND_DST_ALPHA)).toBe(ONE_MINUS_SRC_ALPHA);
    expect(native.getParameter).not.toHaveBeenCalled();
  });

  it('should forward every other parameter to the driver', () => {
    // mock
    const { gl, native } = createGl();

    // before
    cacheGlState(gl);

    // result
    expect(gl.getParameter(MAX_TEXTURE_SIZE)).toBe(4096);
    expect(native.getParameter).toHaveBeenLastCalledWith(MAX_TEXTURE_SIZE);
  });

  it('should track the bound framebuffer for framebuffer and draw-framebuffer targets and still bind it', () => {
    // mock
    const { gl, native } = createGl();
    const first = {} as WebGLFramebuffer;
    const second = {} as WebGLFramebuffer;

    // before
    cacheGlState(gl);
    gl.bindFramebuffer(FRAMEBUFFER, first);

    // result
    expect(native.bindFramebuffer).toHaveBeenCalledWith(FRAMEBUFFER, first);
    expect(gl.getParameter(FRAMEBUFFER_BINDING)).toBe(first);

    // action
    gl.bindFramebuffer(DRAW_FRAMEBUFFER, second);

    // result
    expect(gl.getParameter(FRAMEBUFFER_BINDING)).toBe(second);
  });

  it('should ignore read-framebuffer binds', () => {
    // mock
    const { gl } = createGl();

    // before
    cacheGlState(gl);
    gl.bindFramebuffer(READ_FRAMEBUFFER, {} as WebGLFramebuffer);

    // result
    expect(gl.getParameter(FRAMEBUFFER_BINDING)).toBeNull();
  });

  it('should fall back to the default framebuffer when the bound one is deleted', () => {
    // mock
    const { gl, native } = createGl();
    const bound = {} as WebGLFramebuffer;

    // before
    cacheGlState(gl);
    gl.bindFramebuffer(FRAMEBUFFER, bound);
    gl.deleteFramebuffer(bound);

    // result
    expect(native.deleteFramebuffer).toHaveBeenCalledWith(bound);
    expect(gl.getParameter(FRAMEBUFFER_BINDING)).toBeNull();
  });

  it('should keep the binding when a different framebuffer is deleted', () => {
    // mock
    const { gl } = createGl();
    const bound = {} as WebGLFramebuffer;

    // before
    cacheGlState(gl);
    gl.bindFramebuffer(FRAMEBUFFER, bound);
    gl.deleteFramebuffer({} as WebGLFramebuffer);

    // result
    expect(gl.getParameter(FRAMEBUFFER_BINDING)).toBe(bound);
  });

  it('should track the viewport and return a fresh array each time', () => {
    // mock
    const { gl, native } = createGl();

    // before
    cacheGlState(gl);
    gl.viewport(1, 2, 300, 200);

    // result
    expect(native.viewport).toHaveBeenCalledWith(1, 2, 300, 200);
    expect(Array.from(gl.getParameter(VIEWPORT) as Int32Array)).toEqual([1, 2, 300, 200]);
    expect(gl.getParameter(VIEWPORT)).not.toBe(gl.getParameter(VIEWPORT));
  });

  it('should track blendFunc for both the color and alpha channels', () => {
    // mock
    const { gl, native } = createGl();

    // before
    cacheGlState(gl);
    gl.blendFunc(ONE, SRC_ALPHA);

    // result
    expect(native.blendFunc).toHaveBeenCalledWith(ONE, SRC_ALPHA);
    expect([BLEND_SRC_RGB, BLEND_DST_RGB, BLEND_SRC_ALPHA, BLEND_DST_ALPHA].map((parameter) => gl.getParameter(parameter))).toEqual([
      ONE,
      SRC_ALPHA,
      ONE,
      SRC_ALPHA,
    ]);
  });

  it('should track blendFuncSeparate per channel', () => {
    // mock
    const { gl, native } = createGl();

    // before
    cacheGlState(gl);
    gl.blendFuncSeparate(SRC_ALPHA, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA);

    // result
    expect(native.blendFuncSeparate).toHaveBeenCalledWith(SRC_ALPHA, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA);
    expect([BLEND_SRC_RGB, BLEND_DST_RGB, BLEND_SRC_ALPHA, BLEND_DST_ALPHA].map((parameter) => gl.getParameter(parameter))).toEqual([
      SRC_ALPHA,
      ONE_MINUS_SRC_ALPHA,
      ONE,
      ONE_MINUS_SRC_ALPHA,
    ]);
  });

  it('should patch a context only once', () => {
    // mock
    const { gl, native } = createGl();

    // before
    cacheGlState(gl);
    const patched = gl.viewport;

    cacheGlState(gl);

    // result
    expect(gl.viewport).toBe(patched);
    expect(native.getParameter).toHaveBeenCalledTimes(6);
  });
});
