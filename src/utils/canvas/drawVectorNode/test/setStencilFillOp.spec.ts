// utils
import { setStencilFillOp } from '../setStencilFillOp';

const createGl = (): WebGL2RenderingContext =>
  ({
    BACK: 'back',
    DECR_WRAP: 'decrWrap',
    FRONT: 'front',
    INCR_WRAP: 'incrWrap',
    INVERT: 'invert',
    KEEP: 'keep',
    stencilOp: vi.fn(),
    stencilOpSeparate: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

describe('setStencilFillOp', () => {
  it('should flip the stencil on every covering triangle for the even-odd rule', () => {
    // mock
    const gl = createGl();

    // before
    setStencilFillOp(gl, 'evenOdd');

    // result
    expect(gl.stencilOp).toHaveBeenCalledWith('keep', 'keep', 'invert');
    expect(gl.stencilOpSeparate).not.toHaveBeenCalled();
  });

  it('should count front-facing triangles up and back-facing ones down for the nonzero rule', () => {
    // mock
    const gl = createGl();

    // before
    setStencilFillOp(gl, 'nonZero');

    // result
    expect(gl.stencilOpSeparate).toHaveBeenCalledWith('front', 'keep', 'keep', 'incrWrap');
    expect(gl.stencilOpSeparate).toHaveBeenCalledWith('back', 'keep', 'keep', 'decrWrap');
    expect(gl.stencilOp).not.toHaveBeenCalled();
  });
});
