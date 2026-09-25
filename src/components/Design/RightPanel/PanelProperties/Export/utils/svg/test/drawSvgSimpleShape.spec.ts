// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { drawSvgSimpleShape } from '../drawSvgSimpleShape';

const drawSvgPolygonShapeMock = vi.fn();
const drawSvgStarShapeMock = vi.fn();

vi.mock('../drawSvgPolygonShape', () => ({ drawSvgPolygonShape: (...args: unknown[]): void => drawSvgPolygonShapeMock(...args) }));
vi.mock('../drawSvgStarShape', () => ({ drawSvgStarShape: (...args: unknown[]): void => drawSvgStarShapeMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const polygon: TPolygonNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 10,
  id: 'p',
  name: 'p',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 10,
  x: 0,
  y: 0,
};

const star: TStarNode = { ...polygon, id: 's', name: 's', points: 5, ratio: 0.5, type: NodeType.star };

describe('drawSvgSimpleShape', () => {
  beforeEach(() => {
    drawSvgPolygonShapeMock.mockClear();
    drawSvgStarShapeMock.mockClear();
  });

  it('should dispatch a polygon to drawSvgPolygonShape', () => {
    drawSvgSimpleShape([], polygon, {}, bounds);

    expect(drawSvgPolygonShapeMock).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a star to drawSvgStarShape', () => {
    drawSvgSimpleShape([], star, {}, bounds);

    expect(drawSvgStarShapeMock).toHaveBeenCalledTimes(1);
  });
});
