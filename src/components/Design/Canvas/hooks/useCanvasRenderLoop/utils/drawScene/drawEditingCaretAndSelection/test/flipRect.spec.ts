// utils
import { flipRect } from '../flipRect';

describe('flipRect', () => {
  it('should return the rect unchanged when the box is not flipped', () => {
    // mock
    const box = { flipX: false, flipY: false, height: 100, rotation: 0, width: 100, x: 0, y: 0 };
    const rect = { height: 10, width: 20, x: 5, y: 5 };

    // result
    expect(flipRect(rect, box)).toEqual(rect);
  });

  it('should mirror the rect horizontally when the box is flipped on X', () => {
    // mock
    const box = { flipX: true, flipY: false, height: 100, rotation: 0, width: 100, x: 0, y: 0 };
    const rect = { height: 10, width: 20, x: 10, y: 5 };

    // before
    const flipped = flipRect(rect, box);

    // result
    expect(flipped.x).toBeCloseTo(70);
    expect(flipped.width).toBeCloseTo(20);
    expect(flipped.y).toBeCloseTo(5);
    expect(flipped.height).toBeCloseTo(10);
  });

  it('should mirror the rect vertically when the box is flipped on Y', () => {
    // mock
    const box = { flipX: false, flipY: true, height: 100, rotation: 0, width: 100, x: 0, y: 0 };
    const rect = { height: 10, width: 20, x: 5, y: 10 };

    // before
    const flipped = flipRect(rect, box);

    // result
    expect(flipped.y).toBeCloseTo(80);
    expect(flipped.height).toBeCloseTo(10);
  });
});
