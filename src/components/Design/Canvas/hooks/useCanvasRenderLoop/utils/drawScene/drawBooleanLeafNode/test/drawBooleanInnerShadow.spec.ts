// types
import { BlendMode, EffectType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBooleanInnerShadow } from '../drawBooleanInnerShadow';

const getCachedEffectTextureMock = vi.fn();
const renderTextureMock = vi.fn();
const drawEffectTextureBlendedMock = vi.fn();

vi.mock('utils/canvas/effectTextureCache/getCachedEffectTexture', () => ({
  getCachedEffectTexture: (...args: unknown[]): unknown => getCachedEffectTextureMock(...args),
}));
vi.mock('../renderBooleanInnerShadowTexture', () => ({
  renderBooleanInnerShadowTexture: (...args: unknown[]): unknown => renderTextureMock(...args),
}));
vi.mock('../../drawBoxLeafNode/drawEffectTextureBlended', () => ({
  drawEffectTextureBlended: (...args: unknown[]): void => drawEffectTextureBlendedMock(...args),
}));

describe('drawBooleanInnerShadow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCachedEffectTextureMock.mockReturnValue({ tag: 'tex' });
  });

  it('should draw the cached texture unrotated around the shape bounds with the effect opacity', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const context = { gl } as unknown as TDrawSceneContext;
    const effect = { ...createEffect(EffectType.innerShadow), opacity: 50 };

    // action
    drawBooleanInnerShadow(context, booleanShape, effect, 0.5, BlendMode.multiply);

    // result
    expect(getCachedEffectTextureMock).toHaveBeenCalledWith(gl, expect.stringContaining(EffectType.innerShadow), expect.any(Function));
    expect(drawEffectTextureBlendedMock).toHaveBeenCalledWith(
      context,
      { tag: 'tex' },
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      0,
      0.25,
      BlendMode.multiply,
    );

    const [, , rect] = drawEffectTextureBlendedMock.mock.calls[0];

    expect(rect.x).toBeLessThan(booleanShape.bounds.x);
    expect(rect.width).toBeGreaterThan(booleanShape.bounds.width);
  });

  it('should render the texture only when the cache asks for it', () => {
    // mock
    const context = { gl: {} } as unknown as TDrawSceneContext;
    const effect = createEffect(EffectType.innerShadow);

    getCachedEffectTextureMock.mockImplementation((_gl: unknown, _key: string, build: () => unknown) => build());

    // action
    drawBooleanInnerShadow(context, booleanShape, effect, 1);

    // result
    expect(renderTextureMock).toHaveBeenCalledWith(context, booleanShape, effect);
  });
});
