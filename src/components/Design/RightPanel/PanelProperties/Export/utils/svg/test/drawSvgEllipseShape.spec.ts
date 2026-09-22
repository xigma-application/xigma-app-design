// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawSvgEllipseShape } from '../drawSvgEllipseShape';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

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

describe('drawSvgEllipseShape', () => {
  it('should draw a full ellipse fill', () => {
    const elements: string[] = [];

    drawSvgEllipseShape(elements, ellipse(), 0.5, bounds);

    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('fill="#ff0000"');
    expect(elements[0]).toContain('fill-opacity="0.5"');
  });

  it('should skip the fill draw when there is no fill color', () => {
    const elements: string[] = [];

    drawSvgEllipseShape(elements, ellipse({ fill: '' }), 1, bounds);

    expect(elements).toEqual([]);
  });

  it('should draw a stroke ring after the fill', () => {
    const elements: string[] = [];

    drawSvgEllipseShape(elements, ellipse({ strokeColor: '#0000ff', strokeWidth: 4 }), 1, bounds);

    expect(elements).toHaveLength(2);
    expect(elements[1]).toContain('fill="#0000ff"');
  });

  it('should skip the stroke draw when there is no stroke color or width', () => {
    const elements: string[] = [];

    drawSvgEllipseShape(elements, ellipse({ strokeColor: '#0000ff' }), 1, bounds);

    expect(elements).toHaveLength(1);
  });
});
