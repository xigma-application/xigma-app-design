// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { drawSvgPolygonShape } from '../drawSvgPolygonShape';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 20,
  id: 'p',
  name: 'p',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawSvgPolygonShape', () => {
  it('should draw the fill', () => {
    const elements: string[] = [];

    drawSvgPolygonShape(elements, polygon(), 1, bounds);

    expect(elements).toHaveLength(1);
    expect(elements[0]).toContain('fill="#ff0000"');
  });

  it('should skip the draw when there is no fill color', () => {
    const elements: string[] = [];

    drawSvgPolygonShape(elements, polygon({ fill: '' }), 1, bounds);

    expect(elements).toEqual([]);
  });
});
