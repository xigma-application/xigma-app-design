// utils
import { getStarVertexCountHandlePosition } from '../getStarVertexCountHandlePosition';

const STAR_BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getStarVertexCountHandlePosition', () => {
  it('should sit on vertex index 2 of the star (the next spike outer tip), not the top vertex or the inner vertex between them', () => {
    // mock — for a 100x100 5-point star at ratio 0.5, vertex index 2 sits at (97.552826, 34.549150)
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 5, 0.5, 0);

    // result
    expect(position.x).toBeCloseTo(97.552826, 5);
    expect(position.y).toBeCloseTo(34.54915, 5);
  });

  it('should move to the corresponding index-2 vertex for a different point count', () => {
    // mock — for a 100x100 6-point star at ratio 0.5, vertex index 2 sits at (93.301270, 25)
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 6, 0.5, 0);

    // result
    expect(position.x).toBeCloseTo(93.30127, 5);
    expect(position.y).toBeCloseTo(25, 5);
  });

  it('should track a non-square bounding box the same way', () => {
    // mock — a tall 100x200 5-point star; vertex index 2 sits at (97.552826, 69.098301)
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };
    const position = getStarVertexCountHandlePosition(tallBounds, 5, 0.5, 0);

    // result
    expect(position.x).toBeCloseTo(97.552826, 5);
    expect(position.y).toBeCloseTo(69.098301, 5);
  });

  it("should pull the handle toward center along the tip's own two-edge bisector once a corner radius is applied", () => {
    // mock — the outer tip's own tangent-arc bisector (toward its two adjacent inner vertices),
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 5, 0.5, 10);

    // result
    expect(position.x).toBeCloseTo(85.57378, 4);
    expect(position.y).toBeCloseTo(38.441378, 4);
  });

  it("should clamp the corner radius to this star's own max instead of overshooting past its tip", () => {
    // mock — a 7-point star's own max corner radius is ~8.544, well under the raw cornerRadius of 15;
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 7, 0.5, 15);

    // result
    expect(position.x).toBeCloseTo(77.57966, 4);
    expect(position.y).toBeCloseTo(28.005955, 4);
  });

  it('should flip the handle position across the bounding-box center when flipX/flipY are set', () => {
    // mock — vertex index 2 of a 100x100 5-point star sits at (97.552826, 34.549150), center at
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 5, 0.5, 0, true, true);

    // result
    expect(position.x).toBeCloseTo(2.447174, 5);
    expect(position.y).toBeCloseTo(65.45085, 5);
  });

  it('should flip only the x axis when only flipX is set', () => {
    // mock — vertex index 2 sits at (97.552826, 34.549150), center at (50, 50); flipping only x
    const position = getStarVertexCountHandlePosition(STAR_BOUNDS, 5, 0.5, 0, true, false);

    // result
    expect(position.x).toBeCloseTo(2.447174, 5);
    expect(position.y).toBeCloseTo(34.54915, 5);
  });
});
