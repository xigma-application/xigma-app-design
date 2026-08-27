// utils
import { getEffectiveVectorFillColor } from '../getEffectiveVectorFillColor';
import { getVectorFillColorForLoopKey } from '../getVectorFillColorForLoopKey';

describe('getEffectiveVectorFillColor', () => {
  it('should return the explicit override when the loop key has one', () => {
    expect(getEffectiveVectorFillColor({ fillColorOverrideByKey: { key1: '#ff0000' } }, 'key1')).toBe('#ff0000');
  });

  it('should fall back to the hash-derived color when there is no override map', () => {
    expect(getEffectiveVectorFillColor({}, 'key1')).toBe(getVectorFillColorForLoopKey('key1'));
  });

  it('should fall back to the hash-derived color when the override map has no entry for this key', () => {
    expect(getEffectiveVectorFillColor({ fillColorOverrideByKey: { other: '#ff0000' } }, 'key1')).toBe(
      getVectorFillColorForLoopKey('key1'),
    );
  });
});
