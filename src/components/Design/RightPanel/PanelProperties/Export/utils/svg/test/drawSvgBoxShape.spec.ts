// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawSvgBoxShape } from '../drawSvgBoxShape';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 20,
  id: 'r',
  name: 'r',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawSvgBoxShape', () => {
  it('should draw the fill with the paint opacity as a fraction', () => {
    const elements: string[] = [];

    drawSvgBoxShape(elements, [], rectangle({ fills: [{ color: '#00ff00', opacity: 40, type: 'solid' }] }), {}, bounds);

    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('fill="#00ff00"');
    expect(elements[0]).toContain('fill-opacity="0.4"');
  });

  it('should draw stacked fills bottom to top and skip hidden and non-solid paints', () => {
    const elements: string[] = [];

    drawSvgBoxShape(
      elements,
      [],
      rectangle({
        fills: [
          { color: '#111111', opacity: 100, type: 'solid' },
          { color: '#222222', opacity: 100, type: 'solid', visible: false },
          { opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' },
          { color: '#333333', opacity: 100, type: 'solid' },
        ],
      }),
      {},
      bounds,
    );

    expect(elements).toHaveLength(2);
    expect(elements[0]).toContain('fill="#333333"');
    expect(elements[1]).toContain('fill="#111111"');
  });

  it('should multiply in the inherited opacity of the ancestors', () => {
    const parent: TFrameNode = {
      childIds: ['r'],
      clipContent: false,
      fills: [],
      height: 100,
      id: 'p',
      name: 'p',
      opacity: 0.5,
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    };
    const elements: string[] = [];

    drawSvgBoxShape(elements, [], rectangle({ parentId: 'p' }), { p: parent }, bounds);

    expect(elements[0]).toContain('fill-opacity="0.5"');
  });

  it('should draw the stroke ring after the fill when the node has a stroke', () => {
    const elements: string[] = [];

    drawSvgBoxShape(elements, [], rectangle({ strokeWidth: 2, strokes: [{ color: '#0000ff', opacity: 100, type: 'solid' }] }), {}, bounds);

    expect(elements).toHaveLength(2);
    expect(elements[1]).toContain('fill="#0000ff"');
  });

  it('should skip the stroke draw when the node has no stroke', () => {
    const elements: string[] = [];

    drawSvgBoxShape(elements, [], rectangle(), {}, bounds);

    expect(elements).toHaveLength(1);
  });

  it('should thread the defs array through to a gradient fill', () => {
    const elements: string[] = [];
    const defs: string[] = [];
    const gradient = {
      end: { x: 1, y: 0 },
      opacity: 100,
      start: { x: 0, y: 0 },
      stops: [
        { color: '#ff0000', opacity: 100, position: 0 },
        { color: '#0000ff', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear' as const,
    };

    drawSvgBoxShape(elements, defs, rectangle({ fills: [gradient] }), {}, bounds);

    expect(defs).toHaveLength(1);
    expect(defs[0]).toContain('<linearGradient');
    expect(elements[0]).toContain('fill="url(#XigmaGradient0)"');
  });
});
