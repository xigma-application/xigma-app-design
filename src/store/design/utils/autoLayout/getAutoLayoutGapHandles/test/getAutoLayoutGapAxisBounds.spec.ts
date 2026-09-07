// utils
import { getAxisEnd, getAxisStart } from '../getAutoLayoutGapAxisBounds';

const bound = { height: 30, width: 20, x: 10, y: 5 };

describe('getAxisStart', () => {
  it('should return x for the x axis', () => {
    expect(getAxisStart(bound, 'x')).toBe(10);
  });

  it('should return y for the y axis', () => {
    expect(getAxisStart(bound, 'y')).toBe(5);
  });
});

describe('getAxisEnd', () => {
  it('should return x + width for the x axis', () => {
    expect(getAxisEnd(bound, 'x')).toBe(30);
  });

  it('should return y + height for the y axis', () => {
    expect(getAxisEnd(bound, 'y')).toBe(35);
  });
});
