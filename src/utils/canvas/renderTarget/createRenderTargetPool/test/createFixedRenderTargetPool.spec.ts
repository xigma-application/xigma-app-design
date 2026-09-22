// utils
import { createFixedRenderTargetPool } from '../createFixedRenderTargetPool';
import { createGlMock } from './glMock';

describe('createFixedRenderTargetPool', () => {
  it('should create a target sized to the given dimensions, ignoring the real drawing buffer size', () => {
    // mock
    const gl = createGlMock(1512, 982);
    const pool = createFixedRenderTargetPool(gl, 40, 30);

    // action
    const target = pool.acquire();

    // result
    expect(target.width).toBe(40);
    expect(target.height).toBe(30);
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(1);
    expect(gl.renderbufferStorage).toHaveBeenCalledWith(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, 40, 30);
  });

  it('should recycle a released target instead of allocating a new one', () => {
    // mock
    const gl = createGlMock();
    const pool = createFixedRenderTargetPool(gl, 40, 30);

    // action
    const first = pool.acquire();
    pool.release(first);
    const second = pool.acquire();

    // result
    expect(second).toBe(first);
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(1);
  });

  it('should hand out distinct targets while both are in use, every one at the same fixed size', () => {
    // mock
    const gl = createGlMock();
    const pool = createFixedRenderTargetPool(gl, 40, 30);

    // action
    const a = pool.acquire();
    const b = pool.acquire();

    // result
    expect(a).not.toBe(b);
    expect(a.width).toBe(40);
    expect(b.width).toBe(40);
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(2);
  });

  it('should delete every allocated target on dispose', () => {
    // mock
    const gl = createGlMock();
    const pool = createFixedRenderTargetPool(gl, 40, 30);

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
    const pool = createFixedRenderTargetPool(gl, 40, 30);

    // action
    pool.release({ framebuffer: {}, height: 1, stencil: {}, texture: {}, width: 1 } as never);
    const target = pool.acquire();

    // result
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(1);
    expect(target.width).toBe(40);
  });
});
