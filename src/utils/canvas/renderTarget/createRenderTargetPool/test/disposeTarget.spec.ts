// utils
import { createGlMock } from './glMock';
import { createTarget } from '../createTarget';
import { disposeTarget } from '../disposeTarget';

describe('disposeTarget', () => {
  it('should delete the framebuffer, texture and stencil of the given target', () => {
    // mock
    const gl = createGlMock();
    const target = createTarget(gl, 10, 10);

    // action
    disposeTarget(gl, target);

    // result
    expect(gl.deleteFramebuffer).toHaveBeenCalledWith(target.framebuffer);
    expect(gl.deleteTexture).toHaveBeenCalledWith(target.texture);
    expect(gl.deleteRenderbuffer).toHaveBeenCalledWith(target.stencil);
  });
});
