// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TLineNode, TMediaNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { drawSvgShape } from '../drawSvgShape';

const drawSvgBoxShapeMock = vi.fn();
const drawSvgLineShapeMock = vi.fn();
const drawSvgMediaNodeShapeMock = vi.fn();
const drawSvgSimpleShapeMock = vi.fn();
const drawSvgVectorNodeShapeMock = vi.fn();

vi.mock('../drawSvgBoxShape', () => ({ drawSvgBoxShape: (...args: unknown[]): Promise<void> => drawSvgBoxShapeMock(...args) }));
vi.mock('../drawSvgLineShape', () => ({ drawSvgLineShape: (...args: unknown[]): void => drawSvgLineShapeMock(...args) }));
vi.mock('../drawSvgMediaNodeShape', () => ({
  drawSvgMediaNodeShape: (...args: unknown[]): Promise<void> => drawSvgMediaNodeShapeMock(...args),
}));
vi.mock('../drawSvgSimpleShape', () => ({ drawSvgSimpleShape: (...args: unknown[]): void => drawSvgSimpleShapeMock(...args) }));
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

const line: TLineNode = { id: 'l', name: 'l', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 };

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
    drawSvgSimpleShapeMock.mockClear();
    drawSvgVectorNodeShapeMock.mockClear();
  });

  it('should dispatch a rectangle to drawSvgBoxShape', async () => {
    await drawSvgShape([], [], rectangle, {}, bounds);

    expect(drawSvgBoxShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgLineShapeMock).not.toHaveBeenCalled();
    expect(drawSvgSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a frame to drawSvgBoxShape', async () => {
    await drawSvgShape([], [], frame, {}, bounds);

    expect(drawSvgBoxShapeMock).toHaveBeenCalledTimes(1);
  });

  it('should dispatch an ellipse/polygon/star to drawSvgSimpleShape', async () => {
    await drawSvgShape([], [], ellipse, {}, bounds);

    expect(drawSvgSimpleShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgLineShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a line to drawSvgLineShape', async () => {
    await drawSvgShape([], [], line, {}, bounds);

    expect(drawSvgLineShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a pen-tool vector node to drawSvgVectorNodeShape', async () => {
    await drawSvgShape([], [], vector, {}, bounds);

    expect(drawSvgVectorNodeShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgLineShapeMock).not.toHaveBeenCalled();
    expect(drawSvgSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a media node to drawSvgMediaNodeShape', async () => {
    await drawSvgShape([], [], media, {}, bounds);

    expect(drawSvgMediaNodeShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgMediaNodeShapeMock).toHaveBeenCalledWith([], media, {}, bounds);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgVectorNodeShapeMock).not.toHaveBeenCalled();
  });
});
