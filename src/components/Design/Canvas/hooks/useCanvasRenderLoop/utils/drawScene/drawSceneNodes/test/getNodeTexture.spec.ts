// types
import { EffectType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeTexture } from '../getNodeTexture';

const getNodeEffectOfTypeMock = vi.fn(() => 'texture-effect');

vi.mock('../getNodeEffectOfType', () => ({
  getNodeEffectOfType: (...args: unknown[]): unknown => getNodeEffectOfTypeMock(...(args as [])),
}));

describe('getNodeTexture', () => {
  it('should read the texture effect of the node', () => {
    // mock
    const node = { id: 'n' } as TSceneNode;

    // result
    expect(getNodeTexture(node)).toBe('texture-effect');
    expect(getNodeEffectOfTypeMock).toHaveBeenCalledWith(node, EffectType.texture);
  });
});
