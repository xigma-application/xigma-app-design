import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { drawPdfShape } from '../drawPdfShape';

const drawPdfBoxShapeMock = vi.fn();
const drawPdfSimpleShapeMock = vi.fn();

vi.mock('../drawPdfBoxShape', () => ({ drawPdfBoxShape: (...args: unknown[]): void => drawPdfBoxShapeMock(...args) }));
vi.mock('../drawPdfSimpleShape', () => ({ drawPdfSimpleShape: (...args: unknown[]): void => drawPdfSimpleShapeMock(...args) }));

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

describe('drawPdfShape', () => {
  beforeEach(() => {
    drawPdfBoxShapeMock.mockClear();
    drawPdfSimpleShapeMock.mockClear();
  });

  it('should dispatch a rectangle/frame to drawPdfBoxShape', () => {
    // action
    drawPdfShape(page, rectangle, {}, bounds, states);

    // result
    expect(drawPdfBoxShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfSimpleShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch an ellipse/polygon/star to drawPdfSimpleShape', () => {
    // action
    drawPdfShape(page, ellipse, {}, bounds, states);

    // result
    expect(drawPdfSimpleShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfBoxShapeMock).not.toHaveBeenCalled();
  });
});
