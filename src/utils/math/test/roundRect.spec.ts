// utils
import { roundRect } from '../roundRect';

describe('roundRect', () => {
  it('should round every field to the nearest integer', () => {
    // result
    expect(roundRect({ height: 49.6, width: 100.4, x: 10.5, y: -10.5 })).toEqual({ height: 50, width: 100, x: 11, y: -10 });
  });

  it('should leave an already-integer rect unchanged', () => {
    // result
    expect(roundRect({ height: 50, width: 100, x: 0, y: 0 })).toEqual({ height: 50, width: 100, x: 0, y: 0 });
  });
});
