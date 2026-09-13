// utils
import { getPositionFromClientX } from '../getPositionFromClientX';

const createBar = (left: number, width: number): HTMLDivElement => {
  const bar = document.createElement('div');

  bar.getBoundingClientRect = (): DOMRect => ({ bottom: 0, height: 0, left, right: left + width, top: 0, width }) as DOMRect;

  return bar;
};

describe('getPositionFromClientX', () => {
  it('should return 0 at the left edge and 1 at the right edge', () => {
    // before
    const bar = createBar(100, 200);

    // result
    expect(getPositionFromClientX(100, bar)).toBe(0);
    expect(getPositionFromClientX(300, bar)).toBe(1);
  });

  it('should return the fraction across the bar for a point in between', () => {
    // before
    const bar = createBar(0, 200);

    // result
    expect(getPositionFromClientX(50, bar)).toBe(0.25);
  });

  it('should clamp positions outside the bar bounds', () => {
    // before
    const bar = createBar(100, 200);

    // result
    expect(getPositionFromClientX(0, bar)).toBe(0);
    expect(getPositionFromClientX(1000, bar)).toBe(1);
  });
});
