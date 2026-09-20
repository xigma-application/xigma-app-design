// types
import { BlendMode } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';

// utils
import { drawEffectTextureBlended } from '../drawEffectTextureBlended';

const drawEffectTextureMock = vi.fn();
const drawEffectTextureIsolatedMock = vi.fn();

vi.mock('../drawEffectTexture', () => ({
  drawEffectTexture: (...args: unknown[]): void => drawEffectTextureMock(...args),
}));
vi.mock('../drawEffectTextureIsolated', () => ({
  drawEffectTextureIsolated: (...args: unknown[]): void => drawEffectTextureIsolatedMock(...args),
}));

const context = {} as TDrawSceneContext;
const texture = {} as WebGLTexture;
const rect = { height: 10, width: 20, x: 1, y: 2 };

describe('drawEffectTextureBlended', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the texture straight onto the scene for no blend mode, Normal and Pass through', () => {
    // action
    drawEffectTextureBlended(context, texture, rect, 0, 1);
    drawEffectTextureBlended(context, texture, rect, 0, 1, BlendMode.normal);
    drawEffectTextureBlended(context, texture, rect, 0, 1, BlendMode.passThrough);

    // result
    expect(drawEffectTextureMock).toHaveBeenCalledTimes(3);
    expect(drawEffectTextureIsolatedMock).not.toHaveBeenCalled();
  });

  it('should isolate and composite the texture for a real blend mode', () => {
    // action
    drawEffectTextureBlended(context, texture, rect, 15, 0.5, BlendMode.multiply);

    // result
    expect(drawEffectTextureIsolatedMock).toHaveBeenCalledWith(context, texture, rect, 15, 0.5, BlendMode.multiply);
    expect(drawEffectTextureMock).not.toHaveBeenCalled();
  });
});
