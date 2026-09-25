// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';

// utils
import { createGlProxy } from 'test/createGlProxy';
import { drawEffectIsolated } from '../drawEffectIsolated';

const compositeBlendMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();

vi.mock('../../compositeBlend', () => ({ compositeBlend: (...args: unknown[]): unknown => compositeBlendMock(...args) }));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: (...args: unknown[]): unknown => setAlphaWriteEnabledMock(...args),
}));

describe('drawEffectIsolated', () => {
  it('should paint into an offscreen target and blend it over a copy of the backdrop', () => {
    // mock
    const gl = createGlProxy({
      drawingBufferHeight: 60,
      drawingBufferWidth: 80,
      getParameter: vi.fn((name: string) => (name === 'VIEWPORT' ? Int32Array.from([0, 0, 80, 60]) : name)),
    });
    const backdrop = { framebuffer: 'backdrop-fb', height: 60, texture: 'backdrop', width: 80 };
    const content = { framebuffer: 'content-fb', height: 60, texture: 'content', width: 80 };
    const pool = { acquire: vi.fn().mockReturnValueOnce(backdrop).mockReturnValueOnce(content), release: vi.fn() };
    const context = { gl, imageContext: { isAlphaWriteEnabled: true, renderTargetPool: pool } } as unknown as TDrawSceneContext;
    const paint = vi.fn();

    // before
    drawEffectIsolated(context, BlendMode.multiply, paint);

    // result
    expect(gl.copyTexImage2D).toHaveBeenCalledWith('TEXTURE_2D', 0, 'RGBA', 0, 0, 80, 60, 0);
    expect(gl.bindFramebuffer).toHaveBeenCalledWith('FRAMEBUFFER', 'content-fb');
    expect(paint).toHaveBeenCalledTimes(1);
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith('FRAMEBUFFER', 'FRAMEBUFFER_BINDING');
    expect(setAlphaWriteEnabledMock).toHaveBeenLastCalledWith(gl, context.imageContext, true);
    expect(compositeBlendMock).toHaveBeenCalledWith(context, 'content', 'backdrop', BlendMode.multiply);
    expect(pool.release).toHaveBeenCalledWith(content);
    expect(pool.release).toHaveBeenCalledWith(backdrop);
  });
});
