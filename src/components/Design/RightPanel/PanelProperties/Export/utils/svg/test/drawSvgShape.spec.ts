// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { drawSvgShape } from '../drawSvgShape';

const drawSvgBoxShapeMock = vi.fn();
const drawSvgLineShapeMock = vi.fn();
const drawSvgSimpleShapeMock = vi.fn();

vi.mock('../drawSvgBoxShape', () => ({ drawSvgBoxShape: (...args: unknown[]): void => drawSvgBoxShapeMock(...args) }));
vi.mock('../drawSvgLineShape', () => ({ drawSvgLineShape: (...args: unknown[]): void => drawSvgLineShapeMock(...args) }));
vi.mock('../drawSvgSimpleShape', () => ({ drawSvgSimpleShape: (...args: unknown[]): void => drawSvgSimpleShapeMock(...args) }));

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

describe('drawSvgShape', () => {
  beforeEach(() => {
    drawSvgBoxShapeMock.mockClear();
    drawSvgLineShapeMock.mockClear();
    drawSvgSimpleShapeMock.mockClear();
  });

  it('should dispatch a rectangle to drawSvgBoxShape', () => {
    drawSvgShape([], [], rectangle, {}, bounds);

    expect(drawSvgBoxShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgLineShapeMock).not.toHaveBeenCalled();
    expect(drawSvgSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a frame to drawSvgBoxShape', () => {
    drawSvgShape([], [], frame, {}, bounds);

    expect(drawSvgBoxShapeMock).toHaveBeenCalledTimes(1);
  });

  it('should dispatch an ellipse/polygon/star to drawSvgSimpleShape', () => {
    drawSvgShape([], [], ellipse, {}, bounds);

    expect(drawSvgSimpleShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgLineShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a line to drawSvgLineShape', () => {
    drawSvgShape([], [], line, {}, bounds);

    expect(drawSvgLineShapeMock).toHaveBeenCalledTimes(1);
    expect(drawSvgBoxShapeMock).not.toHaveBeenCalled();
    expect(drawSvgSimpleShapeMock).not.toHaveBeenCalled();
  });
});
