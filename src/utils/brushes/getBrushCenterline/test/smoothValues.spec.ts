// utils
import { smoothValues } from '../smoothValues';

describe('smoothValues', () => {
  it('should leave a constant series unchanged', () => {
    // result
    expect(smoothValues([5, 5, 5, 5])).toEqual([5, 5, 5, 5]);
  });

  it('should average a spike with its neighbours', () => {
    // action
    const smoothed = smoothValues([0, 0, 10, 0, 0]);

    // result
    expect(smoothed[2]).toBeCloseTo(2);
    expect(smoothed[0]).toBeCloseTo(2);
  });
});
