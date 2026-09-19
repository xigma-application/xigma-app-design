// types
import { StrokeDashCap } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getBoxDashedStrokePolygons } from '../getBoxDashedStrokePolygons';

const outer: TPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const inner: TPoint[] = [
  { x: 10, y: 10 },
  { x: 90, y: 10 },
  { x: 90, y: 90 },
  { x: 10, y: 90 },
];

const getArea = (polygon: TPoint[]): number =>
  Math.abs(
    polygon.reduce(
      (total, point, index) =>
        total + (point.x * polygon[(index + 1) % polygon.length].y - polygon[(index + 1) % polygon.length].x * point.y),
      0,
    ),
  ) / 2;

const getTotalArea = (polygons: TPoint[][]): number => polygons.reduce((total, polygon) => total + getArea(polygon), 0);

describe('getBoxDashedStrokePolygons', () => {
  it('should cut the ring into one polygon per dash, covering about the dash share of the ring', () => {
    // before
    const dashes = getBoxDashedStrokePolygons(outer, inner, [20, 20], StrokeDashCap.none)!;

    // result: the 360 unit centre line fits 9 repeats of 20 + 20, and the ring area is 3600
    expect(dashes).toHaveLength(9);
    expect(getTotalArea(dashes)).toBeGreaterThan(1500);
    expect(getTotalArea(dashes)).toBeLessThan(2100);
  });

  it('should keep every dash inside the ring bounds', () => {
    // before
    const dashes = getBoxDashedStrokePolygons(outer, inner, [30, 10], StrokeDashCap.none)!;

    // result
    dashes.flat().forEach((point) => {
      expect(point.x).toBeGreaterThanOrEqual(-0.001);
      expect(point.x).toBeLessThanOrEqual(100.001);
      expect(point.y).toBeGreaterThanOrEqual(-0.001);
      expect(point.y).toBeLessThanOrEqual(100.001);
    });
  });

  it('should make each dash longer with a square cap and add a rounded end with a round cap', () => {
    // before
    const none = getBoxDashedStrokePolygons(outer, inner, [20, 20], StrokeDashCap.none)!;
    const square = getBoxDashedStrokePolygons(outer, inner, [20, 20], StrokeDashCap.square)!;
    const round = getBoxDashedStrokePolygons(outer, inner, [20, 20], StrokeDashCap.round)!;

    // result
    expect(getTotalArea(square)).toBeGreaterThan(getTotalArea(none));
    expect(getTotalArea(round)).toBeGreaterThan(getTotalArea(none));
    expect(round[0].length).toBeGreaterThan(none[0].length);
  });

  it('should turn a zero-length dash with a round cap into a dot', () => {
    // before
    const dots = getBoxDashedStrokePolygons(outer, inner, [0, 40], StrokeDashCap.round)!;

    // result
    expect(dots).toHaveLength(9);
    expect(getArea(dots[1])).toBeGreaterThan(0);
  });

  it('should give up when the pattern would need more dashes than the limit', () => {
    expect(getBoxDashedStrokePolygons(outer, inner, [0.01, 0.01], StrokeDashCap.none)).toBeNull();
  });
});
