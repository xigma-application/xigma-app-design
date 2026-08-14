// utils
import { getEllipseCircumference } from '../getEllipseCircumference';

describe('getEllipseCircumference', () => {
  it("should return the last table entry's cumulative length", () => {
    // result
    expect(
      getEllipseCircumference([
        { angle: 0, cumulativeLength: 0 },
        { angle: 1, cumulativeLength: 5 },
        { angle: 2, cumulativeLength: 12 },
      ]),
    ).toBe(12);
  });

  it('should return 0 for an empty table', () => {
    // result
    expect(getEllipseCircumference([])).toBe(0);
  });
});
