// types
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { createEffectGlMock } from './glMock';
import { drawBooleanNoiseMask } from '../drawBooleanNoiseMask';

const drawVectorFillMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorFill', () => ({
  drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args),
}));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({ setAlphaWriteEnabled: vi.fn() }));

describe('drawBooleanNoiseMask', () => {
  it('should fill the shape in white on the screen into a pooled target and restore the framebuffer', () => {
    // mock
    const gl = createEffectGlMock();
    const mask = { framebuffer: { tag: 'mask-fb' }, height: 200, width: 300 };
    const viewport = { x: 1, y: 2, zoom: 2 };
    const context = {
      buffer: {},
      canvasHeight: 100,
      canvasWidth: 150,
      gl,
      imageContext: { isAlphaWriteEnabled: false, renderTargetPool: { acquire: (): unknown => mask } },
      program: {},
      viewport,
    } as unknown as TDrawSceneContext;

    // action
    const result = drawBooleanNoiseMask(context, booleanShape);

    // result
    expect(result).toBe(mask);
    expect(gl.bindFramebuffer).toHaveBeenCalledWith(gl.FRAMEBUFFER, mask.framebuffer);
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      gl,
      context.program,
      context.buffer,
      null,
      null,
      booleanShape.polygons,
      '#ffffff',
      150,
      100,
      viewport,
      true,
    );
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'p-36006' });
  });
});
