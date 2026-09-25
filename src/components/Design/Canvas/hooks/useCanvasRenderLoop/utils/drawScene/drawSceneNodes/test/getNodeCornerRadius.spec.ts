// types
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeCornerRadius } from '../getNodeCornerRadius';

describe('getNodeCornerRadius', () => {
  it('should read the corner radius, defaulting to zero', () => {
    // result
    expect(getNodeCornerRadius({ cornerRadius: 8 } as TSceneNode)).toBe(8);
    expect(getNodeCornerRadius({ cornerRadius: undefined } as TSceneNode)).toBe(0);
    expect(getNodeCornerRadius({} as TSceneNode)).toBe(0);
  });
});
