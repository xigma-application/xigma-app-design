// utils
import { toSvgPoints } from '../toSvgPoints';

describe('toSvgPoints', () => {
  it('should flip v into a top-down y and join the points for an SVG polyline', () => {
    expect(
      toSvgPoints([
        { s: 0, v: 100 },
        { s: 50, v: 25 },
      ]),
    ).toBe('0,0 50,75');
  });
});
