// types
import { EffectType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { createEffect } from 'utils/design/effects/createEffect';
import { createEffectGlMock } from './glMock';
import { renderBooleanDropShadowTexture } from '../renderBooleanDropShadowTexture';

const createTargetMock = vi.fn();
const disposeTargetMock = vi.fn();
const drawBooleanShapeFillMock = vi.fn();
const blurBoxEffectTextureMock = vi.fn();
const setAlphaWriteEnabledMock = vi.fn();

vi.mock('utils/canvas/renderTarget/createRenderTargetPool/createTarget', () => ({
  createTarget: (...args: unknown[]): unknown => createTargetMock(...args),
}));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/disposeTarget', () => ({
  disposeTarget: (...args: unknown[]): void => disposeTargetMock(...args),
}));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({
  setAlphaWriteEnabled: (...args: unknown[]): void => setAlphaWriteEnabledMock(...args),
}));
vi.mock('../drawBooleanShapeFill', () => ({
  drawBooleanShapeFill: (...args: unknown[]): void => drawBooleanShapeFillMock(...args),
}));
vi.mock('../../drawBoxLeafNode/blurBoxEffectTexture', () => ({
  blurBoxEffectTexture: (...args: unknown[]): void => blurBoxEffectTextureMock(...args),
}));

describe('renderBooleanDropShadowTexture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTargetMock.mockImplementation((_gl: unknown, width: number, height: number) => ({
      framebuffer: { tag: 'fb' },
      height,
      texture: { tag: 'tex' },
      width,
    }));
  });

  it('should fill the shape shifted by the shadow offset, blur it, restore the state and return the blurred target', () => {
    // mock
    const gl = createEffectGlMock();
    const imageContext = { isAlphaWriteEnabled: false };
    const context = { gl, imageContext } as unknown as TDrawSceneContext;
    const effect = { ...createEffect(EffectType.dropShadow), blur: 0, color: '#ff0000', x: 5, y: 7 };

    // action
    const result = renderBooleanDropShadowTexture(context, booleanShape, effect);

    // result
    const [, shape, , origin, color, alpha] = drawBooleanShapeFillMock.mock.calls[0];

    expect(shape).toBe(booleanShape);
    expect({ alpha, color }).toEqual({ alpha: 1, color: '#ff0000' });
    expect(booleanShape.bounds.x - origin.x).toBeGreaterThan(5);
    expect(gl.clearColor).toHaveBeenCalledWith(1, 0, 0, 0);
    expect(blurBoxEffectTextureMock).toHaveBeenCalled();
    expect(gl.bindFramebuffer).toHaveBeenLastCalledWith(gl.FRAMEBUFFER, { tag: 'p-36006' });
    expect(gl.viewport).toHaveBeenLastCalledWith(1, 2, 300, 200);
    expect(setAlphaWriteEnabledMock).toHaveBeenLastCalledWith(gl, imageContext, false);
    expect(result.texture).toEqual({ tag: 'tex' });
    expect(disposeTargetMock).toHaveBeenCalledTimes(1);
  });
});
