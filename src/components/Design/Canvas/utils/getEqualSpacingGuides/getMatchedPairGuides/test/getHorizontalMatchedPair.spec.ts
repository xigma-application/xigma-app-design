// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getHorizontalMatchedPair } from '../getHorizontalMatchedPair';

const ACTIVE = getEdges({ height: 200, width: 100, x: 300, y: 0 });

describe('getHorizontalMatchedPair', () => {
  it('should walk the full chain of same-size, centred neighbours to the left and label the equal gaps', () => {
    // mock — two same-size shapes left of active (x:160 and x:20), equal 40px gaps
    const shapeA = { bounds: { height: 200, width: 100, x: 160, y: 0 } };
    const shapeB = { bounds: { height: 200, width: 100, x: 20, y: 0 } };

    // action
    const guides = getHorizontalMatchedPair(ACTIVE, [shapeA, shapeB], 0.5, 4);

    // result
    expect(guides.labels).toHaveLength(2);
    expect(guides.lines).toHaveLength(3);
    expect(guides.lines[1]).toEqual({ dashed: false, x1: 20, x2: 400, y1: 0, y2: 0 });
  });

  it('should walk a same-size, centred neighbour to the right just as well as one to the left', () => {
    // mock — one same-size shape to the right of active (x:440, 40px gap) — nothing to the left at all
    const right = { bounds: { height: 200, width: 100, x: 440, y: 0 } };

    // action
    const guides = getHorizontalMatchedPair(ACTIVE, [right], 0.5, 4);

    // result — chain of 2 (active + right), spanning active's own left to right's own right
    expect(guides.lines).toHaveLength(3);
    expect(guides.lines[1]).toEqual({ dashed: false, x1: 300, x2: 540, y1: 0, y2: 0 });
  });

  it('should return nothing when the only neighbour is a different size', () => {
    const guides = getHorizontalMatchedPair(ACTIVE, [{ bounds: { height: 200, width: 120, x: 0, y: 0 } }], 0.5, 4);

    expect(guides).toEqual({ labels: [], lines: [], markers: [] });
  });

  it('should return nothing when the neighbour is not centred', () => {
    const guides = getHorizontalMatchedPair(ACTIVE, [{ bounds: { height: 200, width: 100, x: 160, y: 10 } }], 0.5, 4);

    expect(guides).toEqual({ labels: [], lines: [], markers: [] });
  });

  it('should return nothing when there are no candidates', () => {
    expect(getHorizontalMatchedPair(ACTIVE, [], 0.5, 4)).toEqual({ labels: [], lines: [], markers: [] });
  });
});
