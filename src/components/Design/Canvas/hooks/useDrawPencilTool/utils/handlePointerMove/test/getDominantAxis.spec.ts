// utils
import { getDominantAxis } from '../getDominantAxis';

describe('getDominantAxis', () => {
  it('should return null when the movement has not yet cleared the lock threshold', () => {
    // mock — 1px in each direction, under the 4px threshold at zoom 1
    // result
    expect(getDominantAxis({ x: 0, y: 0 }, { x: 1, y: 1 }, 1)).toBeNull();
  });

  it('should return x when the horizontal movement dominates past the threshold', () => {
    // result
    expect(getDominantAxis({ x: 0, y: 0 }, { x: 10, y: 2 }, 1)).toBe('x');
  });

  it('should return y when the vertical movement dominates past the threshold', () => {
    // result
    expect(getDominantAxis({ x: 0, y: 0 }, { x: 2, y: 10 }, 1)).toBe('y');
  });

  it('should scale the threshold down at higher zoom, so a smaller screen-relative move can still lock', () => {
    // mock — a 3px move would stay under the 4px threshold at zoom 1, but at zoom 2 the threshold
    // halves to 2px, so this move clears it
    // result
    expect(getDominantAxis({ x: 0, y: 0 }, { x: 3, y: 0 }, 1)).toBeNull();
    expect(getDominantAxis({ x: 0, y: 0 }, { x: 3, y: 0 }, 2)).toBe('x');
  });
});
