// types
import { BlendMode, EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createEffect } from 'utils/design/effects/createEffect';
import { drawBoxInnerShadow } from '../drawBoxInnerShadow';

const getCachedEffectTextureMock = vi.fn();
const renderInnerShadowTextureMock = vi.fn();
const drawEffectTextureBlendedMock = vi.fn();

vi.mock('utils/canvas/effectTextureCache/getCachedEffectTexture', () => ({
  getCachedEffectTexture: (...args: unknown[]): unknown => getCachedEffectTextureMock(...args),
}));
vi.mock('../renderInnerShadowTexture', () => ({
  renderInnerShadowTexture: (...args: unknown[]): unknown => renderInnerShadowTextureMock(...args),
}));
vi.mock('../drawEffectTextureBlended', () => ({
  drawEffectTextureBlended: (...args: unknown[]): void => drawEffectTextureBlendedMock(...args),
}));

const node: TRectangleNode = {
  cornerRadius: 4,
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 15,
  type: NodeType.rectangle,
  width: 60,
  x: 100,
  y: 200,
};

describe('drawBoxInnerShadow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCachedEffectTextureMock.mockReturnValue({ tag: 'tex' });
  });

  it('should draw the cached shadow texture rotated with the node at the node position minus the margin', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const context = { gl } as unknown as TDrawSceneContext;
    const effect = createEffect(EffectType.innerShadow);

    // action
    drawBoxInnerShadow(context, node, effect, 1, BlendMode.multiply);

    // result
    expect(getCachedEffectTextureMock).toHaveBeenCalledWith(gl, expect.stringContaining(EffectType.innerShadow), expect.any(Function));
    expect(drawEffectTextureBlendedMock).toHaveBeenCalledWith(
      context,
      { tag: 'tex' },
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      15,
      0.25,
      BlendMode.multiply,
    );
  });

  it('should render the shadow texture only when the cache asks for it', () => {
    // mock
    const context = { gl: {} } as unknown as TDrawSceneContext;
    const effect = createEffect(EffectType.innerShadow);

    getCachedEffectTextureMock.mockImplementation((_gl: unknown, _key: string, build: () => unknown) => build());

    // action
    drawBoxInnerShadow(context, node, effect, 1);

    // result
    expect(renderInnerShadowTextureMock).toHaveBeenCalledWith(context, node, effect);
  });
});
