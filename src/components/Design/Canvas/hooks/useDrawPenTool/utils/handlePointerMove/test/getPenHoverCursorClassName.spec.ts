// utils
import { getPenHoverCursorClassName } from '../getPenHoverCursorClassName';

describe('getPenHoverCursorClassName', () => {
  it.each([
    ['active-vertex' as const, 'pen-snap'],
    ['vertex' as const, 'pen-snap'],
    ['edge-snap' as const, 'pen-snap'],
    ['edge' as const, 'pen-extend'],
    [null, 'pen'],
  ])('should return %s cursor className for hoverKind %s', (hoverKind, className) => {
    // result
    expect(getPenHoverCursorClassName(hoverKind)).toBe(className);
  });
});
