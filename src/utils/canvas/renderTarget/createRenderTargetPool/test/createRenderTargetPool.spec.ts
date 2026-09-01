// utils
import { createRenderTargetPool } from '../createRenderTargetPool';

type TGlMock = WebGL2RenderingContext & { drawingBufferHeight: number; drawingBufferWidth: number };

const createGlMock = (width = 200, height = 100): TGlMock =>
  ({
    CLAMP_TO_EDGE: 33071,
    COLOR_ATTACHMENT0: 36064,
    DEPTH24_STENCIL8: 35056,
    DEPTH_STENCIL_ATTACHMENT: 33306,
    FRAMEBUFFER: 36160,
    LINEAR: 9729,
    RENDERBUFFER: 36161,
    RGBA: 6408,
    TEXTURE_2D: 3553,
    TEXTURE_MAG_FILTER: 10240,
    TEXTURE_MIN_FILTER: 10241,
    TEXTURE_WRAP_S: 10242,
    TEXTURE_WRAP_T: 10243,
    UNSIGNED_BYTE: 5121,
    bindFramebuffer: vi.fn(),
    bindRenderbuffer: vi.fn(),
    bindTexture: vi.fn(),
    createFramebuffer: vi.fn(() => ({ tag: 'fb' })),
    createRenderbuffer: vi.fn(() => ({ tag: 'rb' })),
    createTexture: vi.fn(() => ({ tag: 'tex' })),
    deleteFramebuffer: vi.fn(),
    deleteRenderbuffer: vi.fn(),
    deleteTexture: vi.fn(),
    drawingBufferHeight: height,
    drawingBufferWidth: width,
    framebufferRenderbuffer: vi.fn(),
    framebufferTexture2D: vi.fn(),
    renderbufferStorage: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
  }) as unknown as TGlMock;

describe('createRenderTargetPool', () => {
  it('should create a framebuffer sized to the drawing buffer on first acquire', () => {
    // mock
    const gl = createGlMock(256, 128);
    const pool = createRenderTargetPool(gl);

    // action
    const target = pool.acquire();

    // result
    expect(target.width).toBe(256);
    expect(target.height).toBe(128);
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(1);
    expect(gl.renderbufferStorage).toHaveBeenCalledWith(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, 256, 128);
  });

  it('should recycle a released target instead of allocating a new one', () => {
    // mock
    const gl = createGlMock();
    const pool = createRenderTargetPool(gl);

    // action
    const first = pool.acquire();
    pool.release(first);
    const second = pool.acquire();

    // result
    expect(second).toBe(first);
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(1);
  });

  it('should hand out distinct targets while both are in use', () => {
    // mock
    const gl = createGlMock();
    const pool = createRenderTargetPool(gl);

    // action
    const a = pool.acquire();
    const b = pool.acquire();

    // result
    expect(a).not.toBe(b);
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(2);
  });

  it('should drop and rebuild every target when the drawing buffer resizes', () => {
    // mock
    const gl = createGlMock(200, 100);
    const pool = createRenderTargetPool(gl);
    const stale = pool.acquire();
    pool.release(stale);

    // action
    gl.drawingBufferWidth = 400;
    gl.drawingBufferHeight = 300;
    const fresh = pool.acquire();

    // result
    expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(1);
    expect(fresh).not.toBe(stale);
    expect(fresh.width).toBe(400);
  });

  it('should delete every allocated target on dispose', () => {
    // mock
    const gl = createGlMock();
    const pool = createRenderTargetPool(gl);
    pool.acquire();
    pool.acquire();

    // action
    pool.dispose();

    // result
    expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(2);
    expect(gl.deleteTexture).toHaveBeenCalledTimes(2);
    expect(gl.deleteRenderbuffer).toHaveBeenCalledTimes(2);
  });

  it('should ignore a release of a target it does not own', () => {
    // mock
    const gl = createGlMock();
    const pool = createRenderTargetPool(gl);

    // action
    pool.release({ framebuffer: {}, height: 1, stencil: {}, texture: {}, width: 1 } as never);
    const target = pool.acquire();

    // result
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(1);
    expect(target.width).toBe(200);
  });
});
