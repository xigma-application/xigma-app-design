// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getVerticalMatchedPair } from '../getVerticalMatchedPair';

const ACTIVE = getEdges({ height: 100, width: 200, x: 0, y: 300 });

describe('getVerticalMatchedPair', () => {
  it('should walk the full chain of same-size, centred neighbours above and label the equal gaps', () => {
    // mock — two same-size shapes above active (y:160 and y:20), equal 40px gaps throughout
    const shapeA = { bounds: { height: 100, width: 200, x: 0, y: 160 } };
    const shapeB = { bounds: { height: 100, width: 200, x: 0, y: 20 } };

    // action
    const guides = getVerticalMatchedPair(ACTIVE, [shapeA, shapeB], 0.5, 4);

    // result — chain of 3 (active + 2 above), 2 equal gaps → 2 labels
    expect(guides.labels).toHaveLength(2);
    expect(guides.lines).toHaveLength(3);
    // left edge line spans the whole chain (top y:20, bottom y:400)
    expect(guides.lines[1]).toEqual({ dashed: false, x1: 0, x2: 0, y1: 20, y2: 400 });
  });

  it('should return nothing when the only neighbour is a different size', () => {
    const guides = getVerticalMatchedPair(ACTIVE, [{ bounds: { height: 120, width: 200, x: 0, y: 0 } }], 0.5, 4);

    expect(guides).toEqual({ labels: [], lines: [], markers: [] });
  });

  it('should return nothing when the neighbour is not centred', () => {
    const guides = getVerticalMatchedPair(ACTIVE, [{ bounds: { height: 100, width: 200, x: 10, y: 160 } }], 0.5, 4);

    expect(guides).toEqual({ labels: [], lines: [], markers: [] });
  });

  it('should return nothing for a flush-contact neighbour', () => {
    const guides = getVerticalMatchedPair(ACTIVE, [{ bounds: { height: 100, width: 200, x: 0, y: 200 } }], 0.5, 4);

    expect(guides).toEqual({ labels: [], lines: [], markers: [] });
  });

  it('should return nothing when there are no candidates', () => {
    expect(getVerticalMatchedPair(ACTIVE, [], 0.5, 4)).toEqual({ labels: [], lines: [], markers: [] });
  });
});
