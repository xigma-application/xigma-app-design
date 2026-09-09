// utils
import { getWithinLineOffset } from '../getWithinLineOffset';

const child = { height: 20, id: 'a', width: 30 };

describe('getWithinLineOffset', () => {
  it('should pack a child at the start of the line thickness, when counter align is "start"', () => {
    expect(getWithinLineOffset(false, 0, child, 'start', 60, 20)).toBe(0);
  });

  it('should centre a child within the line thickness, when counter align is "center"', () => {
    expect(getWithinLineOffset(false, 0, child, 'center', 60, 20)).toBe(20);
  });

  it('should offset by the baseline difference instead of the normal counter alignment, when baseline aligning', () => {
    // child has no fontSize, so its own baseline offset is its height (20); 30 - 20 = 10
    expect(getWithinLineOffset(true, 30, child, 'center', 60, 20)).toBe(10);
  });
});
