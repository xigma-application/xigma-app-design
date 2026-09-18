// utils
import { toClipPathPoints } from '../toClipPathPoints';

describe('toClipPathPoints', () => {
  it('should flip v into a top-down percentage and join the points for a clip-path polygon', () => {
    expect(
      toClipPathPoints([
        { s: 0, v: 100 },
        { s: 50, v: 25 },
      ]),
    ).toBe('0% 0%, 50% 75%');
  });
});
