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
});
