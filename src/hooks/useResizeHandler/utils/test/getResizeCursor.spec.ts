// utils
import { getResizeCursor } from '../getResizeCursor';

describe('getResizeCursor', () => {
  it('should return ew-resize on the x axis when both directions still have room, not inverted', () => {
    // result
    expect(getResizeCursor(300, 200, 400, false, 'x')).toBe('ew-resize');
  });

  it('should return e-resize on the x axis when at the min, not inverted (only growing right has effect)', () => {
    // result
    expect(getResizeCursor(200, 200, 400, false, 'x')).toBe('e-resize');
  });

  it('should return w-resize on the x axis when at the max, not inverted (only shrinking left has effect)', () => {
    // result
    expect(getResizeCursor(400, 200, 400, false, 'x')).toBe('w-resize');
  });

  it('should return ew-resize on the x axis when both directions still have room, inverted', () => {
    // result
    expect(getResizeCursor(300, 200, 400, true, 'x')).toBe('ew-resize');
  });

  it('should return w-resize on the x axis when at the min, inverted (dragging right shrinks further, blocked; left still grows)', () => {
    // result
    expect(getResizeCursor(200, 200, 400, true, 'x')).toBe('w-resize');
  });

  it('should return e-resize on the x axis when at the max, inverted (dragging left grows further, blocked; right still shrinks)', () => {
    // result
    expect(getResizeCursor(400, 200, 400, true, 'x')).toBe('e-resize');
  });

  it('should return ns-resize on the y axis when both directions still have room, not inverted', () => {
    // result
    expect(getResizeCursor(300, 200, 400, false, 'y')).toBe('ns-resize');
  });

  it('should return s-resize on the y axis when at the min, not inverted (only growing downward has effect)', () => {
    // result
    expect(getResizeCursor(200, 200, 400, false, 'y')).toBe('s-resize');
  });

  it('should return n-resize on the y axis when at the max, not inverted (only shrinking upward has effect)', () => {
    // result
    expect(getResizeCursor(400, 200, 400, false, 'y')).toBe('n-resize');
  });
});
