// utils
import { getGridExtent } from '../getGridExtent';

describe('getGridExtent', () => {
  it('should return the outer bounds of every cell in the grid', () => {
    const cells = [
      [
        { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: 'a' },
        { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: 'b' },
      ],
      [
        { bounds: { height: 50, width: 50, x: 0, y: 100 }, id: 'c' },
        { bounds: { height: 50, width: 50, x: 100, y: 100 }, id: 'd' },
      ],
    ];

    expect(getGridExtent(cells)).toEqual({ bottom: 150, left: 0, right: 150, top: 0 });
  });
});
