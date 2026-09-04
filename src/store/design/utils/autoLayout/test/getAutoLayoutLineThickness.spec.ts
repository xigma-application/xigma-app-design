// utils
import { getAutoLayoutLineThickness } from '../getAutoLayoutLineThickness';

describe('getAutoLayoutLineThickness', () => {
  it('should return zero for an empty line', () => {
    expect(getAutoLayoutLineThickness(true, [])).toBe(0);
  });

  it('should take the tallest child’s height on the horizontal axis', () => {
    const line = [
      { height: 20, id: 'a', width: 30 },
      { height: 50, id: 'b', width: 40 },
    ];

    expect(getAutoLayoutLineThickness(true, line)).toBe(50);
  });

  it('should take the widest child’s width on the vertical axis', () => {
    const line = [
      { height: 30, id: 'a', width: 20 },
      { height: 40, id: 'b', width: 60 },
    ];

    expect(getAutoLayoutLineThickness(false, line)).toBe(60);
  });
});
