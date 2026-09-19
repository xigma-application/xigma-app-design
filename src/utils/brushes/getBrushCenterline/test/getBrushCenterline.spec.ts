// utils
import { createAlpha, straightBand, wavyBand } from '../../test/brushFixtures';
import { getBrushCenterline } from '../getBrushCenterline';

describe('getBrushCenterline', () => {
  it('should run through the middle of a flat band with a horizontal tangent', () => {
    // action
    const centerline = getBrushCenterline(straightBand)!;

    // result
    expect(centerline.points[0].x).toBe(10);
    expect(centerline.points[centerline.points.length - 1].x).toBe(189);
    expect(centerline.points.every((point) => Math.abs(point.y - 29.5) < 0.01)).toBe(true);
    expect(centerline.tangents[50].x).toBeCloseTo(1);
    expect(centerline.tangents[50].y).toBeCloseTo(0);
  });

  it('should follow a wavy band up and down', () => {
    // action
    const centerline = getBrushCenterline(wavyBand)!;
    const ys = centerline.points.map((point) => point.y);

    // result
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(20);
  });

  it('should return null for an empty image', () => {
    // result
    expect(getBrushCenterline(createAlpha(30, 30, () => false))).toBeNull();
  });
});
