import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { drawPdfSimpleShape } from '../drawPdfSimpleShape';

const drawPdfEllipseShapeMock = vi.fn();
const drawPdfPolygonShapeMock = vi.fn();
const drawPdfStarShapeMock = vi.fn();

vi.mock('../drawPdfEllipseShape', () => ({ drawPdfEllipseShape: (...args: unknown[]): void => drawPdfEllipseShapeMock(...args) }));
vi.mock('../drawPdfPolygonShape', () => ({ drawPdfPolygonShape: (...args: unknown[]): void => drawPdfPolygonShapeMock(...args) }));
vi.mock('../drawPdfStarShape', () => ({ drawPdfStarShape: (...args: unknown[]): void => drawPdfStarShapeMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

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

describe('drawPdfSimpleShape', () => {
  beforeEach(() => {
    drawPdfEllipseShapeMock.mockClear();
    drawPdfPolygonShapeMock.mockClear();
    drawPdfStarShapeMock.mockClear();
  });

  it('should dispatch an ellipse to drawPdfEllipseShape', () => {
    // action
    drawPdfSimpleShape(page, ellipse, {}, bounds, states);

    // result
    expect(drawPdfEllipseShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonShapeMock).not.toHaveBeenCalled();
    expect(drawPdfStarShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a polygon to drawPdfPolygonShape', () => {
    // action
    drawPdfSimpleShape(page, polygon, {}, bounds, states);

    // result
    expect(drawPdfPolygonShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfEllipseShapeMock).not.toHaveBeenCalled();
  });

  it('should dispatch a star to drawPdfStarShape', () => {
    // action
    drawPdfSimpleShape(page, star, {}, bounds, states);

    // result
    expect(drawPdfStarShapeMock).toHaveBeenCalledTimes(1);
    expect(drawPdfEllipseShapeMock).not.toHaveBeenCalled();
  });
});
