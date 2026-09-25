// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawSvgEllipseShape } from '../drawSvgEllipseShape';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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
  it('should draw every fill paint of the ellipse with its opacity', async () => {
    // mock
    const elements: string[] = [];
    const defs: string[] = [];

    // action
    await drawSvgEllipseShape(elements, defs, ellipse({ opacity: 0.5 }), {}, bounds);

    // result
    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('fill="#ff0000"');
    expect(elements[0]).toContain('fill-opacity="0.5"');
  });

  it('should draw a gradient fill through a gradient definition', async () => {
    // mock
    const elements: string[] = [];
    const defs: string[] = [];

    // action
    await drawSvgEllipseShape(
      elements,
      defs,
      ellipse({
        fills: [
          {
            end: { x: 1, y: 0.5 },
            opacity: 100,
            start: { x: 0, y: 0.5 },
            stops: [
              { color: '#ff0000', opacity: 100, position: 0 },
              { color: '#0000ff', opacity: 100, position: 1 },
            ],
            type: 'gradient-linear',
          },
        ],
      }),
      {},
      bounds,
    );

    // result
    expect(defs.join('')).toContain('linearGradient');
    expect(elements).toHaveLength(1);
  });

  it('should draw a stroke ring after the fill', async () => {
    // mock
    const elements: string[] = [];

    // action
    await drawSvgEllipseShape(
      elements,
      [],
      ellipse({ strokeWidth: 4, strokes: [{ color: '#0000ff', opacity: 100, type: 'solid' }] }),
      {},
      bounds,
    );

    // result
    expect(elements).toHaveLength(2);
    expect(elements[1]).toContain('fill="#0000ff"');
  });

  it('should skip the stroke without a stroke width', async () => {
    // mock
    const elements: string[] = [];

    // action
    await drawSvgEllipseShape(elements, [], ellipse({ strokes: [{ color: '#0000ff', opacity: 100, type: 'solid' }] }), {}, bounds);

    // result
    expect(elements).toHaveLength(1);
  });
});
