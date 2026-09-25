// utils
import { buildRails } from '../buildRails';

describe('buildRails', () => {
  it('should offset every path point to both sides by the radius', () => {
    // result
    expect(
      buildRails(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
        2,
      ),
    ).toEqual({
      left: [
        { x: 0, y: 2 },
        { x: 10, y: 2 },
      ],
      right: [
        { x: 0, y: -2 },
        { x: 10, y: -2 },
      ],
    });
  });
});
