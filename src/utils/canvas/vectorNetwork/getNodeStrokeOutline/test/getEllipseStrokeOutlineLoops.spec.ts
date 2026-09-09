// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipseStrokeOutlineLoops } from '../getEllipseStrokeOutlineLoops';

const buildEllipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ffffff',
  height: 20,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getEllipseStrokeOutlineLoops', () => {
  it('should return an outer and an inner ellipse loop when the stroke leaves an inner hole', () => {
    // action
    const { inner, outer } = getEllipseStrokeOutlineLoops(buildEllipse(), 2);

    // result
    expect(outer.length).toBeGreaterThan(0);
    expect(inner).not.toBeNull();
  });

  it('should drop the inner loop when the stroke half-width consumes the whole ellipse', () => {
    // action
    const { inner } = getEllipseStrokeOutlineLoops(buildEllipse(), 10);

    // result
    expect(inner).toBeNull();
  });

  it('should offset the outer and inner loops independently for an outside-aligned stroke', () => {
    // action — outer 4, inner 0: outer ring expands to a 28x28 span, inner ring stays on the 20x20 path
    const { inner, outer } = getEllipseStrokeOutlineLoops(buildEllipse(), 4, 0);
    const outerXs = outer.map((point) => point.x);
    const innerXs = (inner ?? []).map((point) => point.x);

    // result
    expect(Math.min(...outerXs)).toBeCloseTo(-4);
    expect(Math.max(...outerXs)).toBeCloseTo(24);
    expect(Math.min(...innerXs)).toBeCloseTo(0);
    expect(Math.max(...innerXs)).toBeCloseTo(20);
  });
});
