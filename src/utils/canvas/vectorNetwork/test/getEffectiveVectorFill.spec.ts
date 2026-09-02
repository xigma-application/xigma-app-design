// utils
import { getEffectiveVectorFill } from '../getEffectiveVectorFill';
import { getVectorFillColorForLoopKey } from '../getVectorFillColorForLoopKey';

describe('getEffectiveVectorFill', () => {
  it('should wrap the explicit override color in a single opaque solid paint', () => {
    expect(getEffectiveVectorFill({ fillColorOverrideByKey: { key1: '#ff0000' } }, 'key1')).toEqual([
      { color: '#ff0000', opacity: 100, type: 'solid' },
    ]);
  });

  it('should wrap the hash-derived fallback color when the key has no override', () => {
    expect(getEffectiveVectorFill({}, 'key1')).toEqual([{ color: getVectorFillColorForLoopKey('key1'), opacity: 100, type: 'solid' }]);
  });
});
