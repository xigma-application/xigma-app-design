// utils
import { getEdges } from '../../../getDistanceGuides/getEdges';
import { getHorizontalMatchedPair } from '../getHorizontalMatchedPair';

const ACTIVE = getEdges({ height: 200, width: 100, x: 200, y: 0 });

describe('getHorizontalMatchedPair', () => {
  it('should produce the centre line and both edge lines for a same-size, centred neighbour to the left', () => {
    // mock — neighbour 100x200 (same size) at x:0..100, 100px gap, same centre y
    const neighbour = { bounds: { height: 200, width: 100, x: 0, y: 0 } };

    // action
    const guides = getHorizontalMatchedPair(ACTIVE, [neighbour], 0.5, 4);

    // result
    expect(guides.lines).toEqual([
      { dashed: false, x1: 250, x2: 0, y1: 100, y2: 100 },
      { dashed: false, x1: 0, x2: 300, y1: 0, y2: 0 },
      { dashed: false, x1: 0, x2: 300, y1: 200, y2: 200 },
    ]);
    expect(guides.markers.length).toBeGreaterThan(0);
  });

  it('should work for a neighbour to the right', () => {
    // mock — neighbour 100x200 at x:400..500
    const neighbour = { bounds: { height: 200, width: 100, x: 400, y: 0 } };

    // action
    const guides = getHorizontalMatchedPair(ACTIVE, [neighbour], 0.5, 4);

    // result — centre line runs to the neighbour's far edge x:500
    expect(guides.lines[0]).toEqual({ dashed: false, x1: 250, x2: 500, y1: 100, y2: 100 });
  });

  it('should return nothing when the neighbour is a different size', () => {
    const guides = getHorizontalMatchedPair(ACTIVE, [{ bounds: { height: 200, width: 120, x: 0, y: 0 } }], 0.5, 4);

    expect(guides).toEqual({ lines: [], markers: [] });
  });

  it('should return nothing when the centres are not aligned', () => {
    const guides = getHorizontalMatchedPair(ACTIVE, [{ bounds: { height: 200, width: 100, x: 0, y: 10 } }], 0.5, 4);

    expect(guides).toEqual({ lines: [], markers: [] });
  });

  it('should return nothing for a flush-contact neighbour (no gap)', () => {
    const guides = getHorizontalMatchedPair(ACTIVE, [{ bounds: { height: 200, width: 100, x: 100, y: 0 } }], 0.5, 4);

    expect(guides).toEqual({ lines: [], markers: [] });
  });

  it('should return nothing when there are no candidates', () => {
    const guides = getHorizontalMatchedPair(ACTIVE, [], 0.5, 4);

    expect(guides).toEqual({ lines: [], markers: [] });
  });
});
