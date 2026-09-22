// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { drawSvgSimpleShape } from '../drawSvgSimpleShape';

const drawSvgEllipseShapeMock = vi.fn();
const drawSvgPolygonShapeMock = vi.fn();
const drawSvgStarShapeMock = vi.fn();

vi.mock('../drawSvgEllipseShape', () => ({ drawSvgEllipseShape: (...args: unknown[]): void => drawSvgEllipseShapeMock(...args) }));
vi.mock('../drawSvgPolygonShape', () => ({ drawSvgPolygonShape: (...args: unknown[]): void => drawSvgPolygonShapeMock(...args) }));
vi.mock('../drawSvgStarShape', () => ({ drawSvgStarShape: (...args: unknown[]): void => drawSvgStarShapeMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const ellipse: TEllipseNode = {
  fill: '#ff0000',
  height: 10,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
};

const polygon: TPolygonNode = { ...ellipse, flipX: false, flipY: false, id: 'p', name: 'p', sides: 5, type: NodeType.polygon };

const star: TStarNode = { ...ellipse, flipX: false, flipY: false, id: 's', name: 's', points: 5, ratio: 0.5, type: NodeType.star };

describe('drawSvgSimpleShape', () => {
  beforeEach(() => {
    drawSvgEllipseShapeMock.mockClear();
    drawSvgPolygonShapeMock.mockClear();
    drawSvgStarShapeMock.mockClear();
  });

  it('should dispatch an ellipse to drawSvgEllipseShape', () => {
    drawSvgSimpleShape([], ellipse, {}, bounds);

    expect(drawSvgEllipseShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgPolygonShapeMock).not.toHaveBeenCalled();
    expect(drawSvgStarShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a polygon to drawSvgPolygonShape', () => {
    drawSvgSimpleShape([], polygon, {}, bounds);

    expect(drawSvgPolygonShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgEllipseShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a star to drawSvgStarShape', () => {
    drawSvgSimpleShape([], star, {}, bounds);

    expect(drawSvgStarShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgEllipseShapeMock).not.toHaveBeenCalled();
  });
});
