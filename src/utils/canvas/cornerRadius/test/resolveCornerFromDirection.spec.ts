// utils
import { resolveCornerFromDirection } from '../resolveCornerFromDirection';

describe('resolveCornerFromDirection', () => {
  it('should return null when there has been no movement yet', () => {
    // result
    expect(resolveCornerFromDirection(['ne', 'nw', 'se', 'sw'], { x: 0, y: 0 })).toBeNull();
  });

  it('should resolve the nw/sw pair toward nw when moving up, matching nw sitting above the collision point', () => {
    // result
    expect(resolveCornerFromDirection(['nw', 'sw'], { x: 0, y: -10 })).toBe('nw');
  });

  it('should resolve the nw/sw pair toward sw when moving down, matching sw sitting below the collision point', () => {
    // result
    expect(resolveCornerFromDirection(['nw', 'sw'], { x: 0, y: 10 })).toBe('sw');
  });

  it('should stay unresolved on a purely horizontal move when the pair only differs vertically', () => {
    // result — nw and sw are both on the left side, so a pure left/right move can't discriminate
    expect(resolveCornerFromDirection(['nw', 'sw'], { x: -10, y: 0 })).toBeNull();
  });

  it('should resolve the ne/se pair toward ne when moving up, and se when moving down', () => {
    // result
    expect(resolveCornerFromDirection(['ne', 'se'], { x: 0, y: -10 })).toBe('ne');
    expect(resolveCornerFromDirection(['ne', 'se'], { x: 0, y: 10 })).toBe('se');
  });

  it('should resolve the nw/ne pair toward nw when moving left, and ne when moving right', () => {
    // result
    expect(resolveCornerFromDirection(['nw', 'ne'], { x: -10, y: 0 })).toBe('nw');
    expect(resolveCornerFromDirection(['nw', 'ne'], { x: 10, y: 0 })).toBe('ne');
  });

  it('should resolve a full 4-way collision to the single quadrant a diagonal move points into', () => {
    // result — moving down-right points squarely into the se quadrant
    expect(resolveCornerFromDirection(['ne', 'nw', 'se', 'sw'], { x: 10, y: 10 })).toBe('se');
    // result — moving up-left points squarely into the nw quadrant
    expect(resolveCornerFromDirection(['ne', 'nw', 'se', 'sw'], { x: -10, y: -10 })).toBe('nw');
  });

  it('should stay unresolved on a 4-way collision when a purely axis-aligned move ties two quadrants', () => {
    // result — pure rightward movement ties ne and se equally (both are on the right)
    expect(resolveCornerFromDirection(['ne', 'nw', 'se', 'sw'], { x: 10, y: 0 })).toBeNull();
  });
});
