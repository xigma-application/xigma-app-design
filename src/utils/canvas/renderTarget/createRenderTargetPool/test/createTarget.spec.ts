// utils
import { createGlMock } from './glMock';
import { createTarget } from '../createTarget';

describe('createTarget', () => {
  it('should allocate a framebuffer, texture and stencil and return them with the given size', () => {
    // mock
    const gl = createGlMock();

    // action
    const target = createTarget(gl, 320, 240);

    // result
    expect(gl.createFramebuffer).toHaveBeenCalledTimes(1);
    expect(gl.createTexture).toHaveBeenCalledTimes(1);
    expect(gl.createRenderbuffer).toHaveBeenCalledTimes(1);
    expect(target.width).toBe(320);
    expect(target.height).toBe(240);
    expect(target).toEqual({
      framebuffer: target.framebuffer,
      height: 240,
      stencil: target.stencil,
      texture: target.texture,
      width: 320,
    });
  });

  it('should configure the texture, stencil storage and framebuffer attachments then unbind everything', () => {
    // mock
    const gl = createGlMock();

    // action
    const target = createTarget(gl, 100, 50);

    // result
    expect(gl.texImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGBA, 100, 50, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    expect(gl.texParameteri).toHaveBeenCalledTimes(4);
    expect(gl.renderbufferStorage).toHaveBeenCalledWith(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, 100, 50);
    expect(gl.framebufferTexture2D).toHaveBeenCalledWith(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);
    expect(gl.framebufferRenderbuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, target.stencil);
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, null);
    expect(gl.bindRenderbuffer).toHaveBeenLastCalledWith(gl.RENDERBUFFER, null);
    expect(gl.bindTexture).toHaveBeenLastCalledWith(gl.TEXTURE_2D, null);
  });
});
