// utils
import { getPolygonVertexCountHandlePosition } from '../getPolygonVertexCountHandlePosition';

const TRIANGLE_BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getPolygonVertexCountHandlePosition', () => {
  it('should sit on vertex index 1 of the polygon, not the top vertex', () => {
    // mock — for a 100x100 triangle, vertex index 1 sits at (93.301270, 75)
    const position = getPolygonVertexCountHandlePosition(TRIANGLE_BOUNDS, 3, 0);

    // result
    expect(position.x).toBeCloseTo(93.30127, 5);
    expect(position.y).toBeCloseTo(75, 10);
  });

  it('should move to the corresponding index-1 vertex for a different side count', () => {
    // mock — for a 100x100 hexagon, vertex index 1 sits at (93.301270, 25)
    const position = getPolygonVertexCountHandlePosition(TRIANGLE_BOUNDS, 6, 0);

    // result
    expect(position.x).toBeCloseTo(93.30127, 5);
    expect(position.y).toBeCloseTo(25, 5);
  });

  it('should track a non-square bounding box the same way', () => {
    // mock — a tall 100x200 triangle; vertex index 1 sits at (93.301270, 150)
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };
    const position = getPolygonVertexCountHandlePosition(tallBounds, 3, 0);

    // result
    expect(position.x).toBeCloseTo(93.30127, 5);
    expect(position.y).toBeCloseTo(150, 10);
  });

  it('should pull the handle toward center once a corner radius is applied, not stay pinned to the sharp vertex', () => {
    // mock — top vertex of a 100x100 triangle sits at (50, 0), setback multiplier 2 for its 60deg
    // angle; vertex index 1 (93.301270, 75) moves toward center by cornerRadius * (2 - 1) = 15
    const position = getPolygonVertexCountHandlePosition(TRIANGLE_BOUNDS, 3, 15);

    // result
    expect(position.x).toBeCloseTo(80.310889, 5);
    expect(position.y).toBeCloseTo(67.5, 5);
  });

  it('should flip the handle position across the bounding-box center when flipX/flipY are set', () => {
    // mock — vertex index 1 of a 100x100 triangle sits at (93.301270, 75), center at (50, 50);
    // flipping both axes mirrors that to (6.698730, 25)
    const position = getPolygonVertexCountHandlePosition(TRIANGLE_BOUNDS, 3, 0, true, true);

    // result
    expect(position.x).toBeCloseTo(6.69873, 5);
    expect(position.y).toBeCloseTo(25, 10);
  });

  it('should flip only the y axis when only flipY is set', () => {
    // mock — vertex index 1 of a 100x100 triangle sits at (93.301270, 75), center at (50, 50);
    // flipping only y mirrors the y coordinate to 25, leaving x untouched
    const position = getPolygonVertexCountHandlePosition(TRIANGLE_BOUNDS, 3, 0, false, true);

    // result
    expect(position.x).toBeCloseTo(93.30127, 5);
    expect(position.y).toBeCloseTo(25, 10);
  });
});
