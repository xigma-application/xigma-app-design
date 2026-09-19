// utils
import { getStrokeDynamicValues } from '../getStrokeDynamicValues';

describe('getStrokeDynamicValues', () => {
  it('should default to Frequency 75, Wiggle 30 and Smoothen 50', () => {
    expect(getStrokeDynamicValues({})).toEqual({ frequency: 75, smoothen: 50, wiggle: 30 });
    expect(getStrokeDynamicValues(undefined)).toEqual({ frequency: 75, smoothen: 50, wiggle: 30 });
  });

  it('should use the values saved on the node', () => {
    expect(getStrokeDynamicValues({ strokeDynamicFrequency: 200, strokeDynamicSmoothen: 0, strokeDynamicWiggle: 60000 })).toEqual({
      frequency: 200,
      smoothen: 0,
      wiggle: 60000,
    });
  });
});
