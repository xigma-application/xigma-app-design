// types
import { EffectType } from 'types/design/enums';

// utils
import { drawBooleanDropShadow } from '../drawBooleanDropShadow';
import { drawBooleanInnerShadow } from '../drawBooleanInnerShadow';
import { drawBooleanNoise } from '../drawBooleanNoise';
import { getBooleanEffectDrawer } from '../getBooleanEffectDrawer';

describe('getBooleanEffectDrawer', () => {
  it('should pick the drawer for each effect type', () => {
    // action / result
    expect(getBooleanEffectDrawer(EffectType.dropShadow)).toBe(drawBooleanDropShadow);
    expect(getBooleanEffectDrawer(EffectType.innerShadow)).toBe(drawBooleanInnerShadow);
    expect(getBooleanEffectDrawer(EffectType.noise)).toBe(drawBooleanNoise);
  });
});
