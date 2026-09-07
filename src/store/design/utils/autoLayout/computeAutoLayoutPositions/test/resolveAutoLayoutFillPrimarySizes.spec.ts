// utils
import { resolveAutoLayoutFillPrimarySizes } from '../resolveAutoLayoutFillPrimarySizes';

describe('resolveAutoLayoutFillPrimarySizes', () => {
  it('should return an empty result when there are no fill candidates', () => {
    expect(resolveAutoLayoutFillPrimarySizes(100, [])).toEqual({});
  });

  it('should split the leftover evenly when no candidate has a min or max', () => {
    const resolved = resolveAutoLayoutFillPrimarySizes(100, [{ id: 'a' }, { id: 'b' }]);

    expect(resolved).toEqual({ a: 50, b: 50 });
  });

  it('should freeze a single candidate at its max, with nothing left to redistribute', () => {
    const resolved = resolveAutoLayoutFillPrimarySizes(100, [{ id: 'a', max: 30 }]);

    expect(resolved).toEqual({ a: 30 });
  });

  it('should redistribute the surplus a max-capped candidate gives back to its unbounded sibling', () => {
    const resolved = resolveAutoLayoutFillPrimarySizes(100, [{ id: 'a', max: 20 }, { id: 'b' }]);

    // a is capped to its 20 max; the 80 it doesn't consume all flows to b instead of being wasted
    expect(resolved).toEqual({ a: 20, b: 80 });
  });

  it('should honor a min above the equal share by pulling leftover from the other candidates, clamped to 0', () => {
    const resolved = resolveAutoLayoutFillPrimarySizes(10, [{ id: 'a', min: 40 }, { id: 'b' }]);

    // a's min (40) exceeds the whole 10px leftover; b is left with nothing rather than a negative size
    expect(resolved).toEqual({ a: 40, b: 0 });
  });
});
