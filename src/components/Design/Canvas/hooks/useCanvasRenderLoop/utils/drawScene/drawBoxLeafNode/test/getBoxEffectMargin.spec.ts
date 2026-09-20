// utils
import { getBoxEffectMargin } from '../getBoxEffectMargin';

describe('getBoxEffectMargin', () => {
  it('should add padding on top of the rounded-up blur radius', () => {
    expect(getBoxEffectMargin(0)).toBe(4);
    expect(getBoxEffectMargin(4)).toBe(8);
    expect(getBoxEffectMargin(4.2)).toBe(9);
  });

  it('should stop growing once the blur is clamped', () => {
    expect(getBoxEffectMargin(1000)).toBe(36);
  });
});
