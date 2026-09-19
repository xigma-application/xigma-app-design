// utils
import { getScatterLayout } from '../getScatterLayout';

describe('getScatterLayout', () => {
  it('should space stamps by Gap percent of the stroke width', () => {
    // action
    const layout = getScatterLayout(400, 500, 4, 220);

    // result
    expect(layout.pitch).toBe(20);
    expect(layout.stampCount).toBe(20);
    expect(layout.dotsPerStamp).toBe(220);
  });

  it('should cap the stamp count and the dots per stamp so the total stays bounded', () => {
    // action
    const layout = getScatterLayout(4000, 1, 4, 220);

    // result
    expect(layout.stampCount).toBeLessThanOrEqual(2500);
    expect(layout.stampCount * layout.dotsPerStamp).toBeLessThanOrEqual(30000 + layout.stampCount * 6);
    expect(layout.dotsPerStamp).toBeGreaterThanOrEqual(6);
  });
});
