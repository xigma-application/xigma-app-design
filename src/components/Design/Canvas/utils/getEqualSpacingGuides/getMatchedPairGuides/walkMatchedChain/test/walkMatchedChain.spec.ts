// types
import { TEqualSpacingCandidate } from '../../../types';

// utils
import { getEdges } from '../../../../getDistanceGuides/getEdges';
import { walkMatchedChain } from '../walkMatchedChain';

const ACTIVE = getEdges({ height: 100, width: 200, x: 0, y: 300 });

describe('walkMatchedChain', () => {
  it('should collect consecutive same-size, centred shapes walking up (sign -1), nearest first', () => {
    // mock — two same-size shapes above active, and a decoy that is a different size
    const near = { bounds: { height: 100, width: 200, x: 0, y: 150 } };
    const far = { bounds: { height: 100, width: 200, x: 0, y: 0 } };
    const wrongSize = { bounds: { height: 100, width: 240, x: 0, y: 200 } };

    // action
    const run = walkMatchedChain(ACTIVE, [near, wrongSize, far], new Set(), 'vertical', -1, 0.5, 4);

    // result — outward order: nearest, then farther
    expect(run).toEqual([getEdges(near.bounds), getEdges(far.bounds)]);
  });

  it('should stop at the first gap where the chain breaks', () => {
    // mock — one shape above, then a big gap to nothing
    const above = { bounds: { height: 100, width: 200, x: 0, y: 150 } };

    // action
    const run = walkMatchedChain(ACTIVE, [above], new Set(), 'vertical', -1, 0.5, 4);

    // result
    expect(run).toEqual([getEdges(above.bounds)]);
  });

  it('should skip a shape that is not centred on the perpendicular axis', () => {
    // mock — same size, directly above, but shifted 10px in x (beyond the 4px tolerance)
    const offset = { bounds: { height: 100, width: 200, x: 10, y: 150 } };

    // action
    const run = walkMatchedChain(ACTIVE, [offset], new Set(), 'vertical', -1, 0.5, 4);

    // result
    expect(run).toEqual([]);
  });

  it('should not reuse a shape already in `used`', () => {
    // mock
    const above: TEqualSpacingCandidate = { bounds: { height: 100, width: 200, x: 0, y: 150 } };
    const used = new Set<TEqualSpacingCandidate>([above]);

    // action
    const run = walkMatchedChain(ACTIVE, [above], used, 'vertical', -1, 0.5, 4);

    // result
    expect(run).toEqual([]);
  });

  it('should walk right (sign +1) on the horizontal axis', () => {
    // mock
    const active = getEdges({ height: 200, width: 100, x: 300, y: 0 });
    const right = { bounds: { height: 200, width: 100, x: 450, y: 0 } };

    // action
    const run = walkMatchedChain(active, [right], new Set(), 'horizontal', 1, 0.5, 4);

    // result
    expect(run).toEqual([getEdges(right.bounds)]);
  });
});
