// utils
import { getAutoLayoutDropInsertionIndex } from '../getAutoLayoutDropInsertionIndex';

describe('getAutoLayoutDropInsertionIndex', () => {
  it('should return 0 for an empty list of children', () => {
    expect(getAutoLayoutDropInsertionIndex(true, 50, [], [])).toBe(0);
  });

  it('should return 0 when the cursor is before every child’s midpoint, on the horizontal axis', () => {
    const positions = [{ id: 'a', x: 100, y: 0 }];
    const children = [{ height: 20, id: 'a', width: 40 }];

    expect(getAutoLayoutDropInsertionIndex(true, 50, positions, children)).toBe(0);
  });

  it('should return the list length when the cursor is past every child’s midpoint, on the horizontal axis', () => {
    const positions = [{ id: 'a', x: 0, y: 0 }];
    const children = [{ height: 20, id: 'a', width: 40 }];

    expect(getAutoLayoutDropInsertionIndex(true, 100, positions, children)).toBe(1);
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
    expect(getAutoLayoutDropInsertionIndex(false, 25, positions, children)).toBe(1);
  });
});
