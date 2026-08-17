// utils
import { getStarVertexCountHandlePosition } from '../getStarVertexCountHandlePosition';

const STAR_BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getStarVertexCountHandlePosition', () => {
  it('should sit on vertex index 2 of the star (the next spike outer tip), not the top vertex or the inner vertex between them', () => {
    // mock — for a 100x100 5-point star at ratio 0.5, vertex index 2 sits at (97.552826, 34.549150)
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 5, 0.5);

    // result
    expect(position.x).toBeCloseTo(97.552826, 5);
    expect(position.y).toBeCloseTo(34.54915, 5);
  });

  it('should move to the corresponding index-2 vertex for a different point count', () => {
    // mock — for a 100x100 6-point star at ratio 0.5, vertex index 2 sits at (93.301270, 25)
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 6, 0.5);

    // result
    expect(position.x).toBeCloseTo(93.30127, 5);
    expect(position.y).toBeCloseTo(25, 5);
  });

  it('should track a non-square bounding box the same way', () => {
    // mock — a tall 100x200 5-point star; vertex index 2 sits at (97.552826, 69.098301)
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };
    const position = getStarVertexCountHandlePosition(tallBounds, 5, 0.5);

    // result
    expect(position.x).toBeCloseTo(97.552826, 5);
    expect(position.y).toBeCloseTo(69.098301, 5);
  });

  it('should flip the handle position across the bounding-box center when flipX/flipY are set', () => {
    // mock — vertex index 2 of a 100x100 5-point star sits at (97.552826, 34.549150), center at
    // (50, 50); flipping both axes mirrors that to (2.447174, 65.450850)
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 5, 0.5, true, true);

    // result
    expect(position.x).toBeCloseTo(2.447174, 5);
    expect(position.y).toBeCloseTo(65.45085, 5);
  });

  it('should flip only the x axis when only flipX is set', () => {
    // mock — vertex index 2 sits at (97.552826, 34.549150), center at (50, 50); flipping only x
    // mirrors the x coordinate to 2.447174, leaving y untouched
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 5, 0.5, true, false);

    // result
    expect(position.x).toBeCloseTo(2.447174, 5);
    expect(position.y).toBeCloseTo(34.54915, 5);
  });
});
