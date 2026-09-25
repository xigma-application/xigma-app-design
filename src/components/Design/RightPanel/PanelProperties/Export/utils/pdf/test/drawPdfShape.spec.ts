import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TPolygonNode, TLineNode, TStarNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { drawPdfShape } from '../drawPdfShape';

const drawPdfBoxShapeMock = vi.fn();
const drawPdfEllipseShapeMock = vi.fn();
const drawPdfLineShapeMock = vi.fn();
const drawPdfPolygonShapeMock = vi.fn();
const drawPdfSimpleShapeMock = vi.fn();
const drawPdfVectorNodeShapeMock = vi.fn();

vi.mock('../drawPdfBoxShape', () => ({ drawPdfBoxShape: (...args: unknown[]): void => drawPdfBoxShapeMock(...args) }));
vi.mock('../drawPdfEllipseShape', () => ({
  drawPdfEllipseShape: (...args: unknown[]): void => drawPdfEllipseShapeMock(...args),
}));
vi.mock('../drawPdfLineShape', () => ({ drawPdfLineShape: (...args: unknown[]): void => drawPdfLineShapeMock(...args) }));
vi.mock('../drawPdfPolygonShape', () => ({
  drawPdfPolygonShape: (...args: unknown[]): void => drawPdfPolygonShapeMock(...args),
}));
vi.mock('../drawPdfSimpleShape', () => ({ drawPdfSimpleShape: (...args: unknown[]): void => drawPdfSimpleShapeMock(...args) }));
vi.mock('../drawPdfVectorNodeShape', () => ({
  drawPdfVectorNodeShape: (...args: unknown[]): void => drawPdfVectorNodeShapeMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

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

const star: TStarNode = { ...polygon, fill: '#ff0000', id: 's', name: 's', points: 5, ratio: 0.5, type: NodeType.star };

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

describe('drawPdfShape', () => {
  beforeEach(() => {
    drawPdfBoxShapeMock.mockClear();
    drawPdfLineShapeMock.mockClear();
    drawPdfSimpleShapeMock.mockClear();
    drawPdfVectorNodeShapeMock.mockClear();
  });

  it('should dispatch a rectangle to drawPdfBoxShape', () => {
    // action
    drawPdfShape(page, rectangle, {}, bounds, states);

    // result
    expect(drawPdfBoxShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfLineShapeMock).not.toHaveBeenCalled();
    expect(drawPdfSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a frame to drawPdfBoxShape', () => {
    // action
    drawPdfShape(page, frame, {}, bounds, states);

    // result
    expect(drawPdfBoxShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfLineShapeMock).not.toHaveBeenCalled();
    expect(drawPdfSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch an ellipse to drawPdfEllipseShape', () => {
    // action
    drawPdfShape(page, ellipse, {}, bounds, states);

    // result
    expect(drawPdfEllipseShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a polygon to drawPdfPolygonShape', () => {
    // action
    drawPdfShape(page, polygon, {}, bounds, states);

    // result
    expect(drawPdfPolygonShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a star to drawPdfSimpleShape', () => {
    // action
    drawPdfShape(page, star, {}, bounds, states);

    // result
    expect(drawPdfSimpleShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfBoxShapeMock).not.toHaveBeenCalled();
    expect(drawPdfLineShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a line to drawPdfLineShape', () => {
    // action
    drawPdfShape(page, line, {}, bounds, states);

    // result
    expect(drawPdfLineShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfBoxShapeMock).not.toHaveBeenCalled();
    expect(drawPdfSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a pen-tool vector node to drawPdfVectorNodeShape', () => {
    // action
    drawPdfShape(page, vector, {}, bounds, states);

    // result
    expect(drawPdfVectorNodeShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfBoxShapeMock).not.toHaveBeenCalled();
    expect(drawPdfLineShapeMock).not.toHaveBeenCalled();
    expect(drawPdfSimpleShapeMock).not.toHaveBeenCalled();
  });
});
