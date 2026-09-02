// utils
import { getMatchedPairGuides } from '../getMatchedPairGuides';

describe('getMatchedPairGuides', () => {
  it('should return the vertical match when a same-size neighbour is stacked vertically', () => {
    // mock — active 200x100 at y:200, same-size neighbour above at y:0
    const guides = getMatchedPairGuides(
      { height: 100, width: 200, x: 0, y: 200 },
      [{ bounds: { height: 100, width: 200, x: 0, y: 0 } }],
      0.5,
      4,
    );

    // result — centre line is vertical
    expect(guides.lines[0]).toMatchObject({ x1: 100, x2: 100 });
  });

  it('should return the horizontal match when there is no vertical one', () => {
    // mock — active 100x200 at x:200, same-size neighbour to the left at x:0
    const guides = getMatchedPairGuides(
      { height: 200, width: 100, x: 200, y: 0 },
      [{ bounds: { height: 200, width: 100, x: 0, y: 0 } }],
      0.5,
      4,
    );

    // result — centre line is horizontal
    expect(guides.lines[0]).toMatchObject({ y1: 100, y2: 100 });
  });

  it('should return both matches when the shape sits at the crossing of a vertical and a horizontal chain', () => {
    // mock — active 100x100 at (200, 200); same-size neighbours above, below, left and right (140px gaps)
    const guides = getMatchedPairGuides(
      { height: 100, width: 100, x: 200, y: 200 },
      [
        { bounds: { height: 100, width: 100, x: 200, y: 0 } },
        { bounds: { height: 100, width: 100, x: 200, y: 400 } },
        { bounds: { height: 100, width: 100, x: 0, y: 200 } },
        { bounds: { height: 100, width: 100, x: 400, y: 200 } },
      ],
      0.5,
      4,
    );

    // result — a vertical centre line AND a horizontal centre line
    expect(guides.lines).toEqual(
      expect.arrayContaining([expect.objectContaining({ x1: 250, x2: 250 }), expect.objectContaining({ y1: 250, y2: 250 })]),
    );
  });

  it('should return nothing when no candidate matches on either axis', () => {
    const guides = getMatchedPairGuides({ height: 100, width: 200, x: 0, y: 200 }, [], 0.5, 4);

    expect(guides).toEqual({ labels: [], lines: [], markers: [] });
  });
});
