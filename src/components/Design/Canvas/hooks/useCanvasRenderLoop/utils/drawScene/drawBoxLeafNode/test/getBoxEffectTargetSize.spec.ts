// utils
import { getBoxEffectTargetSize } from '../getBoxEffectTargetSize';

describe('getBoxEffectTargetSize', () => {
  it('should grow the node size by the margin on every side, rounded up', () => {
    expect(getBoxEffectTargetSize({ height: 20, width: 40.4 }, 8)).toEqual({ height: 36, width: 57 });
  });

  it('should never be smaller than one pixel or larger than the cap', () => {
    expect(getBoxEffectTargetSize({ height: 0, width: 0 }, 0)).toEqual({ height: 1, width: 1 });
    expect(getBoxEffectTargetSize({ height: 100000, width: 100000 }, 8)).toEqual({ height: 4096, width: 4096 });
  });
});
