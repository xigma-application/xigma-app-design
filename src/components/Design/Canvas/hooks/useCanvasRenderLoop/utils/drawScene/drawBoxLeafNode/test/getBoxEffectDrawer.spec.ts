// types
import { EffectType } from 'types/design/enums';

// utils
import { drawBoxDropShadow } from '../drawBoxDropShadow';
import { drawBoxInnerShadow } from '../drawBoxInnerShadow';
import { drawBoxNoise } from '../drawBoxNoise';
import { getBoxEffectDrawer } from '../getBoxEffectDrawer';

describe('getBoxEffectDrawer', () => {
  it('should pick the drawer for each drawable effect type', () => {
    // result
    expect(getBoxEffectDrawer(EffectType.dropShadow)).toBe(drawBoxDropShadow);
    expect(getBoxEffectDrawer(EffectType.innerShadow)).toBe(drawBoxInnerShadow);
    expect(getBoxEffectDrawer(EffectType.noise)).toBe(drawBoxNoise);
  });
});
