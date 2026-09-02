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

  it('should fall back to the horizontal match when there is no vertical one', () => {
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

  it('should return nothing when no candidate matches on either axis', () => {
    const guides = getMatchedPairGuides({ height: 100, width: 200, x: 0, y: 200 }, [], 0.5, 4);

    expect(guides).toEqual({ labels: [], lines: [], markers: [] });
  });
});
