// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { drawSvgStarShape } from '../drawSvgStarShape';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const star = (overrides: Partial<TStarNode> = {}): TStarNode => ({
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 20,
  id: 's',
  name: 's',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawSvgStarShape', () => {
  it('should draw the fill', () => {
    const elements: string[] = [];

    drawSvgStarShape(elements, star(), 1, bounds);

    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('fill="#ff0000"');
  });

  it('should skip the draw when there is no fill color', () => {
    const elements: string[] = [];

    drawSvgStarShape(elements, star({ fill: '' }), 1, bounds);

    expect(elements).toEqual([]);
  });
});
