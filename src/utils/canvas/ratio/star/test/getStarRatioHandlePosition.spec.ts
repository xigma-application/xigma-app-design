// utils
import { getStarRatioHandlePosition } from '../getStarRatioHandlePosition';

const STAR_BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getStarRatioHandlePosition', () => {
  it('should sit on vertex index 1 of the star (the inner vertex between the tip and the next spike), not on either outer vertex', () => {
    // mock — for a 100x100 5-point star at ratio 0.5, vertex index 1 sits at (64.694631, 29.774575)
    const position = getStarRatioHandlePosition(STAR_BOUNDS, 5, 0.5, 0);

    // result
    expect(position.x).toBeCloseTo(64.694631, 5);
    expect(position.y).toBeCloseTo(29.774575, 5);
  });

  it('should move to the corresponding index-1 vertex for a different point count', () => {
    // mock — for a 100x100 6-point star at ratio 0.5, vertex index 1 sits at (62.5, 28.349365)
    const position = getStarRatioHandlePosition(STAR_BOUNDS, 6, 0.5, 0);

    // result
    expect(position.x).toBeCloseTo(62.5, 5);
    expect(position.y).toBeCloseTo(28.349365, 5);
  });

  it('should track a non-square bounding box the same way', () => {
    // mock — a tall 100x200 5-point star; vertex index 1 sits at (64.694631, 59.549150)
    const tallBounds = { height: 200, width: 100, x: 0, y: 0 };
    const position = getStarRatioHandlePosition(tallBounds, 5, 0.5, 0);

    // result
    expect(position.x).toBeCloseTo(64.694631, 5);
    expect(position.y).toBeCloseTo(59.54915, 5);
  });

  it("should pull the handle toward center along the inner vertex's own two-edge bisector once a corner radius is applied", () => {
    // mock — the inner vertex's own tangent-arc bisector (toward the tip and the next spike)
    const position = getStarRatioHandlePosition(STAR_BOUNDS, 5, 0.5, 10);

    // result
    expect(position.x).toBeCloseTo(65.457434, 4);
    expect(position.y).toBeCloseTo(28.724667, 4);
  });

  it("should clamp the corner radius to this star's own max instead of overshooting past the inner vertex", () => {
    // mock — a 5-point, ratio-0.5 star's own max corner radius is ~13.011, well under the raw cornerRadius of 15
    const position = getStarRatioHandlePosition(STAR_BOUNDS, 5, 0.5, 15);

    // result
    expect(position.x).toBeCloseTo(65.687108, 4);
    expect(position.y).toBeCloseTo(28.408548, 4);
  });

  it('should flip the handle position across the bounding-box center when flipX/flipY are set', () => {
    // mock — vertex index 1 sits at (64.694631, 29.774575), center at (50, 50)
    const position = getStarRatioHandlePosition(STAR_BOUNDS, 5, 0.5, 0, true, true);

    // result
    expect(position.x).toBeCloseTo(35.305369, 5);
    expect(position.y).toBeCloseTo(70.225425, 5);
  });

  it('should flip only the x axis when only flipX is set', () => {
    // mock — vertex index 1 sits at (64.694631, 29.774575), center at (50, 50); flipping only x
    const position = getStarRatioHandlePosition(STAR_BOUNDS, 5, 0.5, 0, true, false);

    // result
    expect(position.x).toBeCloseTo(35.305369, 5);
    expect(position.y).toBeCloseTo(29.774575, 5);
  });
});
