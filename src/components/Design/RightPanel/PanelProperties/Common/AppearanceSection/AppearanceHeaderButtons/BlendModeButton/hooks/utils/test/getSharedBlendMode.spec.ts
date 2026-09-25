// types
import { BlendMode } from 'types/design/enums';
import { TAppearanceNode } from '../../../../../types';

// utils
import { getSharedBlendMode } from '../getSharedBlendMode';

describe('getSharedBlendMode', () => {
  it('should treat a missing blend mode as pass through', () => {
    // result
    expect(getSharedBlendMode([{}, { blendMode: BlendMode.passThrough }] as TAppearanceNode[])).toBe(BlendMode.passThrough);
    expect(getSharedBlendMode([])).toBe(BlendMode.passThrough);
  });

  it('should return undefined for mixed blend modes', () => {
    // result
    expect(getSharedBlendMode([{ blendMode: BlendMode.darken }, {}] as TAppearanceNode[])).toBeUndefined();
  });
});
