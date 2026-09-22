// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipseStrokeRingPoints } from '../getEllipseStrokeRingPoints';

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ff0000',
  height: 20,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getEllipseStrokeRingPoints', () => {
  it('should return an outer and inner ring of the ellipse segment count', () => {
    const [outerPoints, innerPoints] = getEllipseStrokeRingPoints(ellipse(), 4);

    expect(outerPoints).toHaveLength(64);
    expect(innerPoints).toHaveLength(64);
  });

  it('should respect the stroke align when insetting the ring', () => {
    const [outerPoints, innerPoints] = getEllipseStrokeRingPoints(ellipse({ strokeAlign: StrokeAlign.inside }), 4);

    expect(outerPoints[0].x).toBeCloseTo(20);
    expect(innerPoints[0].x).toBeCloseTo(16);
  });
});
