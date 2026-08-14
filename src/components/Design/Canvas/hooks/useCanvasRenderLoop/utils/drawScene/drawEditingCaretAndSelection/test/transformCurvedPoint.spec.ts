// utils
import { transformCurvedPoint } from '../transformCurvedPoint';

const BOX = { flipX: false, flipY: false, height: 100, rotation: 0, width: 100, x: 0, y: 0 };
const POINT = { angleDegrees: 0, x: 80, y: 50 };

describe('transformCurvedPoint', () => {
  it('should return the point unchanged when the box is not rotated or flipped', () => {
    // result
    expect(transformCurvedPoint(POINT, BOX)).toEqual(POINT);
  });

  it("should mirror the point across the box's own center when flipped horizontally", () => {
    // before
    const flipped = transformCurvedPoint(POINT, { ...BOX, flipX: true });

    // result
    expect(flipped.x).toBeCloseTo(20);
    expect(flipped.y).toBeCloseTo(50);
    expect(flipped.angleDegrees).toBeCloseTo(180);
  });

  it("should mirror the point across the box's own center when flipped vertically", () => {
    // before
    const flipped = transformCurvedPoint({ angleDegrees: 30, x: 50, y: 80 }, { ...BOX, flipY: true });

    // result
    expect(flipped.x).toBeCloseTo(50);
    expect(flipped.y).toBeCloseTo(20);
    expect(flipped.angleDegrees).toBeCloseTo(-30);
  });

  it('should mirror across both axes (equivalent to a 180-degree point reflection) when flipped both ways', () => {
    // before
    const flipped = transformCurvedPoint(POINT, { ...BOX, flipX: true, flipY: true });

    // result
    expect(flipped.x).toBeCloseTo(20);
    expect(flipped.y).toBeCloseTo(50);
    expect(flipped.angleDegrees).toBeCloseTo(180);
  });

  it("should rotate the point around the box's own center, following its rotation", () => {
    // before
    const rotated = transformCurvedPoint(POINT, { ...BOX, rotation: 90 });

    // result
    expect(rotated.x).toBeCloseTo(50);
    expect(rotated.y).toBeCloseTo(80);
    expect(rotated.angleDegrees).toBeCloseTo(90);
  });

  it('should flip first, then rotate, matching the order the renderer applies both transforms', () => {
    // before
    const transformed = transformCurvedPoint(POINT, { ...BOX, flipX: true, rotation: 90 });

    // result
    expect(transformed.x).toBeCloseTo(50);
    expect(transformed.y).toBeCloseTo(20);
    expect(transformed.angleDegrees).toBeCloseTo(270);
  });

  it("should preserve any extra fields on the point, such as a selection rect's height/width", () => {
    // mock
    const rect = { angleDegrees: 0, height: 12, width: 24, x: 80, y: 50 };

    // result
    expect(transformCurvedPoint(rect, BOX)).toEqual(rect);
  });
});
