// utils
import { getAutoLayoutDropInsertionIndex } from '../getAutoLayoutDropInsertionIndex';

describe('getAutoLayoutDropInsertionIndex', () => {
  it('should return 0 for an empty list of children', () => {
    expect(getAutoLayoutDropInsertionIndex(true, 50, [], [], null)).toBe(0);
  });

  it('should return 0 when the cursor is before every child’s midpoint, on the horizontal axis', () => {
    const positions = [{ id: 'a', x: 100, y: 0 }];
    const children = [{ height: 20, id: 'a', width: 40 }];

    expect(getAutoLayoutDropInsertionIndex(true, 50, positions, children, null)).toBe(0);
  });

  it('should return the list length when the cursor is past every child’s midpoint, on the horizontal axis', () => {
    const positions = [{ id: 'a', x: 0, y: 0 }];
    const children = [{ height: 20, id: 'a', width: 40 }];

    expect(getAutoLayoutDropInsertionIndex(true, 100, positions, children, null)).toBe(1);
  });

  it('should land between two children when the cursor sits between their midpoints, on the vertical axis', () => {
    const positions = [
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 0, y: 30 },
    ];
    const children = [
      { height: 20, id: 'a', width: 20 },
      { height: 20, id: 'b', width: 20 },
    ];

    // a's midpoint is y=10, b's midpoint is y=40 — a cursor at y=25 lands between them
    expect(getAutoLayoutDropInsertionIndex(false, 25, positions, children, null)).toBe(1);
  });

  it('should swap past a sibling that originally came after the dragged item as soon as the cursor touches its own near edge, not its midpoint', () => {
    // mock — sibling 'b' originally followed the dragged item (originalIndex 0), spans y20-40
    const positions = [{ id: 'b', x: 0, y: 20 }];
    const children = [{ height: 20, id: 'b', width: 20 }];

    // result — the instant the cursor touches y=20 it counts as passed, well before its y=30 midpoint
    expect(getAutoLayoutDropInsertionIndex(false, 20, positions, children, 0)).toBe(1);
    expect(getAutoLayoutDropInsertionIndex(false, 19, positions, children, 0)).toBe(0);
  });

  it('should swap past a sibling that originally came before the dragged item as soon as the cursor touches its own far edge, not its midpoint', () => {
    // mock — sibling 'a' originally preceded the dragged item (originalIndex 1), spans y0-20
    const positions = [{ id: 'a', x: 0, y: 0 }];
    const children = [{ height: 20, id: 'a', width: 20 }];

    // result — the sibling stays counted as “passed” until the cursor drops below its own far
    // edge (y=20), not just its y=10 midpoint
    expect(getAutoLayoutDropInsertionIndex(false, 20, positions, children, 1)).toBe(1);
    expect(getAutoLayoutDropInsertionIndex(false, 19, positions, children, 1)).toBe(0);
  });
});
