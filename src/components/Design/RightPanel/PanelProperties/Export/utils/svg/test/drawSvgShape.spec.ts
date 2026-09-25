// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TPolygonNode, TLineNode, TStarNode, TMediaNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { drawSvgShape } from '../drawSvgShape';

const drawSvgBoxShapeMock = vi.fn();
const drawSvgEllipseShapeMock = vi.fn();
const drawSvgLineShapeMock = vi.fn();
const drawSvgMediaNodeShapeMock = vi.fn();
const drawSvgPolygonShapeMock = vi.fn();
const drawSvgVectorNodeShapeMock = vi.fn();

vi.mock('../drawSvgBoxShape', () => ({ drawSvgBoxShape: (...args: unknown[]): Promise<void> => drawSvgBoxShapeMock(...args) }));
vi.mock('../drawSvgEllipseShape', () => ({
  drawSvgEllipseShape: (...args: unknown[]): Promise<void> => drawSvgEllipseShapeMock(...args),
}));
vi.mock('../drawSvgLineShape', () => ({ drawSvgLineShape: (...args: unknown[]): void => drawSvgLineShapeMock(...args) }));
vi.mock('../drawSvgMediaNodeShape', () => ({
  drawSvgMediaNodeShape: (...args: unknown[]): Promise<void> => drawSvgMediaNodeShapeMock(...args),
}));
vi.mock('../drawSvgPolygonShape', () => ({
  drawSvgPolygonShape: (...args: unknown[]): Promise<void> => drawSvgPolygonShapeMock(...args),
}));
vi.mock('../drawSvgVectorNodeShape', () => ({
  drawSvgVectorNodeShape: (...args: unknown[]): Promise<void> => drawSvgVectorNodeShapeMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const rectangle: TRectangleNode = {
  fills: [],
  height: 10,
  id: 'r',
  name: 'r',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

const ellipse: TEllipseNode = {
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
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

const polygon: TPolygonNode = {
  ...ellipse,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  flipX: false,
  flipY: false,
  id: 'p',
  name: 'p',
  sides: 5,
  type: NodeType.polygon,
};

const star: TStarNode = { ...polygon, id: 's', name: 's', points: 5, ratio: 0.5, type: NodeType.star };

const line: TLineNode = {
  height: 0,
  id: 'l',
  name: 'l',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 10,
  x: 0,
  y: 0,
};

const vector: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vec',
  name: 'vec',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const frame: TFrameNode = {
  childIds: [],
  clipContent: false,
  fills: [],
  height: 10,
  id: 'f',
  name: 'f',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const media: TMediaNode = {
  flipX: false,
  flipY: false,
  height: 10,
  id: 'm',
  name: 'm',
  parentId: null,
  rotation: 0,
  src: 's',
  type: NodeType.media,
  width: 10,
  x: 0,
  y: 0,
};

describe('drawSvgShape', () => {
  beforeEach(() => {
    drawSvgBoxShapeMock.mockClear();
    drawSvgLineShapeMock.mockClear();
    drawSvgMediaNodeShapeMock.mockClear();
    drawSvgPolygonShapeMock.mockClear();
    drawSvgVectorNodeShapeMock.mockClear();
  });

  it('should dispatch a rectangle to drawSvgBoxShape', async () => {
    await drawSvgShape([], [], rectangle, {}, bounds);

    expect(drawSvgBoxShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgLineShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a frame to drawSvgBoxShape', async () => {
    await drawSvgShape([], [], frame, {}, bounds);

    expect(drawSvgBoxShapeMock).toHaveBeenCalledTimes(1);
  });

  it('should dispatch an ellipse to drawSvgEllipseShape', async () => {
    // action
    await drawSvgShape([], [], ellipse, {}, bounds);

    // result
    expect(drawSvgEllipseShapeMock).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a polygon to drawSvgPolygonShape', async () => {
    // action
    await drawSvgShape([], [], polygon, {}, bounds);

    // result
    expect(drawSvgPolygonShapeMock).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a star to drawSvgPolygonShape', async () => {
    await drawSvgShape([], [], star, {}, bounds);

    expect(drawSvgPolygonShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgLineShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a line to drawSvgLineShape', async () => {
    await drawSvgShape([], [], line, {}, bounds);

    expect(drawSvgLineShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a pen-tool vector node to drawSvgVectorNodeShape', async () => {
    await drawSvgShape([], [], vector, {}, bounds);

    expect(drawSvgVectorNodeShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgLineShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a media node to drawSvgMediaNodeShape', async () => {
    await drawSvgShape([], [], media, {}, bounds);

    expect(drawSvgMediaNodeShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgMediaNodeShapeMock).toHaveBeenCalledWith([], media, {}, bounds);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgVectorNodeShapeMock).not.toHaveBeenCalled();
  });
});
