// utils
import { isPointInEllipse } from '../isPointInEllipse';

const ellipse = { height: 10, width: 20, x: 0, y: 0 };

describe('isPointInEllipse', () => {
  it('should return true for the center point', () => {
    // result
    expect(isPointInEllipse({ x: 10, y: 5 }, ellipse)).toBe(true);
  });

  it('should return true for a point on the ellipse boundary', () => {
    // result
    expect(isPointInEllipse({ x: 20, y: 5 }, ellipse)).toBe(true);
  });

  it('should return false for a point outside the ellipse but inside its bounding box', () => {
    // result — the (0, 0) corner of the 20x10 bounding rect sits outside the ellipse inscribed in it
    expect(isPointInEllipse({ x: 0, y: 0 }, ellipse)).toBe(false);
  });

  it('should return false for a point far outside the ellipse', () => {
    // result
    expect(isPointInEllipse({ x: 100, y: 100 }, ellipse)).toBe(false);
  });
});
