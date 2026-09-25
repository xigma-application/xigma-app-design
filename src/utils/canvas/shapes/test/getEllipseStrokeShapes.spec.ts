// types
import { NodeType, StrokeAlign, StrokeMode } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getEllipseFillPoints } from '../getEllipseFillPoints';
import { getEllipseStrokeShapes } from '../getEllipseStrokeShapes';

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills: [],
  height: 100,
  id: 'e',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  strokeWidth: 10,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const getRadiusRange = (points: { x: number; y: number }[]): number[] => {
  const radii = points.map((point) => Math.hypot(point.x - 50, point.y - 50));
  return [Math.round(Math.min(...radii)), Math.round(Math.max(...radii))];
};

const getWinding = (point: TPoint, polygon: TPoint[]): number =>
  polygon.reduce((winding, start, index) => {
    const end = polygon[(index + 1) % polygon.length];
    const side = (end.x - start.x) * (point.y - start.y) - (point.x - start.x) * (end.y - start.y);

    switch (true) {
      case start.y <= point.y && end.y > point.y && side > 0:
        return winding + 1;
      case start.y > point.y && end.y <= point.y && side < 0:
        return winding - 1;
      default:
        return winding;
    }
  }, 0);

const getDistanceToOutline = (point: TPoint, outline: TPoint[]): number =>
  Math.min(
    ...outline.map((start, index) => {
      const end = outline[(index + 1) % outline.length];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));

      return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy);
    }),
  );

describe('getEllipseStrokeShapes', () => {
  it('should draw an inside stroke by default, filled even-odd', () => {
    // before
    const [shape] = getEllipseStrokeShapes(ellipse()) ?? [];

    // result
    expect(shape.fillRule).toBe('evenOdd');
    expect(shape.polygons.map(getRadiusRange).sort()).toEqual([
      [40, 40],
      [50, 50],
    ]);
  });

  it('should follow the position of the stroke', () => {
    // before
    const [shape] = getEllipseStrokeShapes(ellipse({ strokeAlign: StrokeAlign.outside })) ?? [];

    // result
    expect(shape.polygons.map(getRadiusRange).sort()).toEqual([
      [50, 50],
      [60, 60],
    ]);
  });

  it('should stroke the outer edge and the hole of a ring separately', () => {
    // result
    expect(getEllipseStrokeShapes(ellipse({ arcRatio: 0.5 }))).toHaveLength(2);
  });

  it('should draw the stroke mode along the shape', () => {
    // before
    const [shape] = getEllipseStrokeShapes(ellipse({ strokeMode: StrokeMode.dynamic })) ?? [];

    // result
    expect(shape.polygons.flat().length).toBeGreaterThan(0);
  });

  it('should reuse the shapes for the same node and draw nothing without a stroke width', () => {
    // mock
    const node = ellipse();

    // result
    expect(getEllipseStrokeShapes(node)).toBe(getEllipseStrokeShapes(node));
    expect(getEllipseStrokeShapes(ellipse({ strokeWidth: 0 }))).toBeNull();
    expect(getEllipseStrokeShapes(ellipse({ strokeWidth: undefined }))).toBeNull();
  });

  it('should paint the whole inside band of a cut arc, including its corners, without holes', () => {
    // mock
    const node = ellipse({ arcEndAngle: 180, arcStartAngle: 90, height: 150, strokeWidth: 20, width: 200 });
    const outline = getEllipseFillPoints(node);
    const [shape] = getEllipseStrokeShapes(node) ?? [];
    const missed: TPoint[] = [];

    // before
    for (let x = 1; x < 200; x += 2) {
      for (let y = 1; y < 150; y += 2) {
        const point = { x, y };
        const distance = getDistanceToOutline(point, outline);
        const isInBand = getWinding(point, outline) !== 0 && distance > 1 && distance < 19;
        const winding = shape.polygons.reduce((total, polygon) => total + getWinding(point, polygon), 0);
        const isPainted = shape.fillRule === 'nonZero' ? winding !== 0 : winding % 2 !== 0;

        if (isInBand && !isPainted) {
          missed.push(point);
        }
      }
    }

    // result
    expect(missed).toEqual([]);
  });

  it('should centre the band on the outline for a centred stroke', () => {
    // before
    const [shape] = getEllipseStrokeShapes(ellipse({ strokeAlign: StrokeAlign.center })) ?? [];

    // result
    expect(shape.polygons.map(getRadiusRange).sort()).toEqual([
      [45, 45],
      [55, 55],
    ]);
  });
});
