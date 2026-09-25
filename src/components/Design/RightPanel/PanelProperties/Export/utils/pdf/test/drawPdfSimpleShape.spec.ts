import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode, TStarNode } from 'types/design/types';

// utils
import { drawPdfSimpleShape } from '../drawPdfSimpleShape';

const drawPdfPolygonShapeMock = vi.fn();
const drawPdfStarShapeMock = vi.fn();

vi.mock('../drawPdfPolygonShape', () => ({ drawPdfPolygonShape: (...args: unknown[]): void => drawPdfPolygonShapeMock(...args) }));
vi.mock('../drawPdfStarShape', () => ({ drawPdfStarShape: (...args: unknown[]): void => drawPdfStarShapeMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

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

describe('drawPdfSimpleShape', () => {
  beforeEach(() => {
    drawPdfPolygonShapeMock.mockClear();
    drawPdfStarShapeMock.mockClear();
  });

  it('should dispatch a polygon to drawPdfPolygonShape', () => {
    // action
    drawPdfSimpleShape(page, polygon, {}, bounds, states);

    // result
    expect(drawPdfPolygonShapeMock).toHaveBeenCalledTimes(1);
  });

  it('should dispatch a star to drawPdfStarShape', () => {
    // action
    drawPdfSimpleShape(page, star, {}, bounds, states);

    // result
    expect(drawPdfStarShapeMock).toHaveBeenCalledTimes(1);
  });
});
