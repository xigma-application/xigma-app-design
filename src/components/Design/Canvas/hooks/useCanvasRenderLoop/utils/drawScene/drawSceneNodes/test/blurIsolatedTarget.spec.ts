// types
import { TMaskRenderer } from '../types';
import { TRenderTarget } from 'utils/canvas/renderTarget/createRenderTargetPool/types';

// utils
import { blurIsolatedTarget } from '../blurIsolatedTarget';

const blurBoxEffectTextureMock = vi.fn();

vi.mock('../../drawBoxLeafNode/blurBoxEffectTexture', () => ({
  blurBoxEffectTexture: (...args: unknown[]): void => blurBoxEffectTextureMock(...args),
}));

describe('blurIsolatedTarget', () => {
  it('should blur the target through a pooled temp target as a plain copy, then restore the scene blend func and release the temp', () => {
    // mock
    const temp = { tag: 'temp' } as unknown as TRenderTarget;
    const target = { tag: 'target' } as unknown as TRenderTarget;
    const calls: string[] = [];
    const gl = {
      ONE: 1,
      ONE_MINUS_SRC_ALPHA: 771,
      SRC_ALPHA: 770,
      ZERO: 0,
      blendFunc: vi.fn(() => calls.push('copy')),
      blendFuncSeparate: vi.fn(() => calls.push('scene')),
    };
    const pool = { acquire: vi.fn(() => temp), release: vi.fn() };
    const imageContext = {};
    const renderer = { context: { imageContext }, gl, pool } as unknown as TMaskRenderer;

    blurBoxEffectTextureMock.mockImplementation(() => calls.push('blur'));

    // action
    blurIsolatedTarget(renderer, target, 8);

    // result
    expect(calls).toEqual(['copy', 'blur', 'scene']);
    expect(blurBoxEffectTextureMock).toHaveBeenCalledWith(gl, imageContext, target, temp, 8);
    expect(gl.blendFuncSeparate).toHaveBeenCalledWith(770, 771, 1, 771);
    expect(pool.release).toHaveBeenCalledWith(temp);
  });
});
