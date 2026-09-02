// utils
import { getEffectiveVectorFill } from '../getEffectiveVectorFill';
import { getVectorFillColorForLoopKey } from '../getVectorFillColorForLoopKey';

describe('getEffectiveVectorFill', () => {
  it('should return the explicit override when the loop key has one', () => {
    expect(getEffectiveVectorFill({ fillByKey: { key1: [{ color: '#ff0000', opacity: 50, type: 'solid' }] } }, 'key1')).toEqual([
      { color: '#ff0000', opacity: 50, type: 'solid' },
    ]);
  });

  it('should fall back to a single opaque solid paint at the hash-derived color when there is no override map', () => {
    expect(getEffectiveVectorFill({}, 'key1')).toEqual([{ color: getVectorFillColorForLoopKey('key1'), opacity: 100, type: 'solid' }]);
  });

  it('should fall back to the hash-derived color when the override map has no entry for this key', () => {
    expect(getEffectiveVectorFill({ fillByKey: { other: [{ color: '#ff0000', opacity: 100, type: 'solid' }] } }, 'key1')).toEqual([
      { color: getVectorFillColorForLoopKey('key1'), opacity: 100, type: 'solid' },
    ]);
  });
});
