// types
import { EffectType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { createEffect } from 'utils/design/effects/createEffect';
import { createEffectGlMock } from './glMock';
import { renderBooleanInnerShadowTexture } from '../renderBooleanInnerShadowTexture';

const createTargetMock = vi.fn();
const disposeTargetMock = vi.fn();
const drawBooleanShapeFillMock = vi.fn();
const blurBoxEffectTextureMock = vi.fn();
const compositeMaskMock = vi.fn();

vi.mock('utils/canvas/renderTarget/createRenderTargetPool/createTarget', () => ({
  createTarget: (...args: unknown[]): unknown => createTargetMock(...args),
}));
vi.mock('utils/canvas/renderTarget/createRenderTargetPool/disposeTarget', () => ({
  disposeTarget: (...args: unknown[]): void => disposeTargetMock(...args),
}));
vi.mock('utils/canvas/setAlphaWriteEnabled', () => ({ setAlphaWriteEnabled: vi.fn() }));
vi.mock('../drawBooleanShapeFill', () => ({
  drawBooleanShapeFill: (...args: unknown[]): void => drawBooleanShapeFillMock(...args),
}));
vi.mock('../../drawBoxLeafNode/blurBoxEffectTexture', () => ({
  blurBoxEffectTexture: (...args: unknown[]): void => blurBoxEffectTextureMock(...args),
}));
vi.mock('../../compositeMask', () => ({
  compositeMask: (...args: unknown[]): void => compositeMaskMock(...args),
}));

describe('renderBooleanInnerShadowTexture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTargetMock.mockImplementation((_gl: unknown, width: number, height: number) => ({
      framebuffer: { tag: `fb-${createTargetMock.mock.calls.length}` },
      height,
      texture: { tag: `tex-${createTargetMock.mock.calls.length}` },
      width,
    }));
  });

  it('should punch the offset shape out of a solid color, blur it, clip it to the shape and return the clipped target', () => {
    // mock
    const gl = createEffectGlMock();
    const context = { gl, imageContext: { isAlphaWriteEnabled: false } } as unknown as TDrawSceneContext;
    const effect = { ...createEffect(EffectType.innerShadow), blur: 0, color: '#0000ff', x: 3, y: 4 };

    // action
    const result = renderBooleanInnerShadowTexture(context, booleanShape, effect);

    // result
    const [hole, mask] = drawBooleanShapeFillMock.mock.calls;

    expect(gl.clearColor).toHaveBeenCalledWith(0, 0, 1, 1);
    expect(hole[5]).toBe(0);
    expect(mask[4]).toBe('#ffffff');
    expect(mask[3].x - hole[3].x).toBe(3);
    expect(mask[3].y - hole[3].y).toBe(4);
    expect(blurBoxEffectTextureMock).toHaveBeenCalled();
    expect(compositeMaskMock).toHaveBeenCalledWith(context, { tag: 'tex-1' }, { tag: 'tex-3' });
    expect(result.texture).toEqual({ tag: 'tex-2' });
    expect(disposeTargetMock).toHaveBeenCalledTimes(2);
  });
});
