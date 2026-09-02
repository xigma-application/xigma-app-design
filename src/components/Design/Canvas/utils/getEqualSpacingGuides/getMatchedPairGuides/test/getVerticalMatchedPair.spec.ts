// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getVerticalMatchedPair } from '../getVerticalMatchedPair';

const ACTIVE = getEdges({ height: 100, width: 200, x: 0, y: 200 });

describe('getVerticalMatchedPair', () => {
  it('should produce the centre line and both edge lines for a same-size, centred neighbour above', () => {
    // mock — neighbour is 200x100 (same size), sits at y:0..100 with a 100px gap, same centre x
    const neighbour = { bounds: { height: 100, width: 200, x: 0, y: 0 } };

    // action
    const guides = getVerticalMatchedPair(ACTIVE, [neighbour], 0.5, 4);

    // result — centre line (from active centre y:250 up to the neighbour's far edge y:0) + 2 edge lines
    expect(guides.lines).toEqual([
      { dashed: false, x1: 100, x2: 100, y1: 250, y2: 0 },
      { dashed: false, x1: 0, x2: 0, y1: 0, y2: 300 },
      { dashed: false, x1: 200, x2: 200, y1: 0, y2: 300 },
    ]);
    expect(guides.markers.length).toBeGreaterThan(0);
  });

  it('should work for a neighbour below', () => {
    // mock — neighbour 200x100 at y:400..500, gap below active
    const neighbour = { bounds: { height: 100, width: 200, x: 0, y: 400 } };

    // action
    const guides = getVerticalMatchedPair(ACTIVE, [neighbour], 0.5, 4);

    // result — centre line runs down to the neighbour's far edge y:500
    expect(guides.lines[0]).toEqual({ dashed: false, x1: 100, x2: 100, y1: 250, y2: 500 });
  });

  it('should return nothing when the neighbour is a different size', () => {
    // action
    const guides = getVerticalMatchedPair(ACTIVE, [{ bounds: { height: 120, width: 200, x: 0, y: 0 } }], 0.5, 4);

    // result
    expect(guides).toEqual({ lines: [], markers: [] });
  });

  it('should return nothing when the centres are not aligned', () => {
    // mock — same size, above, but shifted 10px in x (beyond the 4px tolerance)
    const guides = getVerticalMatchedPair(ACTIVE, [{ bounds: { height: 100, width: 200, x: 10, y: 0 } }], 0.5, 4);

    // result
    expect(guides).toEqual({ lines: [], markers: [] });
  });

  it('should return nothing for a flush-contact neighbour (no gap)', () => {
    // mock — same size, centred, but touching active's top edge exactly
    const guides = getVerticalMatchedPair(ACTIVE, [{ bounds: { height: 100, width: 200, x: 0, y: 100 } }], 0.5, 4);

    // result
    expect(guides).toEqual({ lines: [], markers: [] });
  });

  it('should return nothing when there are no candidates', () => {
    // action
    const guides = getVerticalMatchedPair(ACTIVE, [], 0.5, 4);

    // result
    expect(guides).toEqual({ lines: [], markers: [] });
  });
});
