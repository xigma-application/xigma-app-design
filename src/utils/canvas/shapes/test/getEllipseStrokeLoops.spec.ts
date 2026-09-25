// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipseStrokeLoops } from '../getEllipseStrokeLoops';

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills: [],
  height: 100,
  id: 'e',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const getRadii = (points: { x: number; y: number }[]): number[] => points.map((point) => Math.hypot(point.x - 50, point.y - 50));

describe('getEllipseStrokeLoops', () => {
  it('should give a full ellipse one outline loop', () => {
    // before
    const loops = getEllipseStrokeLoops(ellipse());

    // result
    expect(loops).toHaveLength(1);
    expect(loops[0].isHole).toBe(false);
    expect(Math.min(...getRadii(loops[0].points))).toBeCloseTo(50);
  });

  it('should give a ring without a cut an outer loop and a hole loop', () => {
    // before
    const loops = getEllipseStrokeLoops(ellipse({ arcRatio: 0.5, flipX: true, flipY: true }));
    const unflipped = getEllipseStrokeLoops(ellipse({ arcRatio: 0.5 }));

    // result
    expect(loops.map(({ isHole }) => isHole)).toEqual([false, true]);
    expect(Math.max(...getRadii(loops[0].points))).toBeCloseTo(50);
    expect(Math.max(...getRadii(loops[1].points))).toBeCloseTo(25);
    expect(Math.max(...getRadii(unflipped[1].points))).toBeCloseTo(25);
  });

  it('should give a cut arc one loop along its shape', () => {
    // before
    const loops = getEllipseStrokeLoops(ellipse({ arcEndAngle: 180, arcRatio: 0.5 }));

    // result
    expect(loops).toHaveLength(1);
    expect(Math.min(...getRadii(loops[0].points))).toBeCloseTo(25);
  });
});
