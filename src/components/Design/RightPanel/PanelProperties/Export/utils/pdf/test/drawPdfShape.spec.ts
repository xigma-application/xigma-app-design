import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { drawPdfShape } from '../drawPdfShape';

const drawPdfBoxShapeMock = vi.fn();
const drawPdfLineShapeMock = vi.fn();
const drawPdfSimpleShapeMock = vi.fn();
const drawPdfVectorNodeShapeMock = vi.fn();

vi.mock('../drawPdfBoxShape', () => ({ drawPdfBoxShape: (...args: unknown[]): void => drawPdfBoxShapeMock(...args) }));
vi.mock('../drawPdfLineShape', () => ({ drawPdfLineShape: (...args: unknown[]): void => drawPdfLineShapeMock(...args) }));
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

const line: TLineNode = {
  id: 'l',
  name: 'l',
  parentId: null,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
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

  it('should dispatch an ellipse/polygon/star to drawPdfSimpleShape', () => {
    // action
    drawPdfShape(page, ellipse, {}, bounds, states);

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
