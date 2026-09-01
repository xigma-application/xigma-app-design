// utils
import { getHoveredRowSlot } from '../getHoveredRowSlot';

const ROW_HEIGHT = 32;

describe('getHoveredRowSlot', () => {
  it('should report the row under the pointer and where inside it the pointer sits', () => {
    // action — 40px down the list, container at top 0, no scroll
    const slot = getHoveredRowSlot(40, 0, 0, ROW_HEIGHT, 4);

    // result — row 1, a quarter of the way down (8 / 32)
    expect(slot).toEqual({ index: 1, offsetRatio: 0.25 });
  });

  it('should fold the container top offset and scroll position into the row lookup', () => {
    // action — pointer at viewport y 10, container starts at y 100, list scrolled 64px
    const slot = getHoveredRowSlot(10, 100, 64, ROW_HEIGHT, 6);

    // result — offsetY = 10 - 100 + 64 = -26 → clamped to row 0
    expect(slot.index).toBe(0);
  });

  it('should clamp the index to the last row when the pointer runs past the end', () => {
    // action
    const slot = getHoveredRowSlot(1000, 0, 0, ROW_HEIGHT, 3);

    // result
    expect(slot.index).toBe(2);
  });

  it('should clamp the index to 0 for an empty list', () => {
    // action
    const slot = getHoveredRowSlot(1000, 0, 0, ROW_HEIGHT, 0);

    // result
    expect(slot.index).toBe(0);
  });
});
