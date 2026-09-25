import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { drawPdfSimpleShape } from '../drawPdfSimpleShape';

const drawPdfStarShapeMock = vi.fn();

vi.mock('../drawPdfStarShape', () => ({ drawPdfStarShape: (...args: unknown[]): void => drawPdfStarShapeMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

const star: TStarNode = {
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 10,
  id: 's',
  name: 's',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 10,
  x: 0,
  y: 0,
};

describe('drawPdfSimpleShape', () => {
  it('should draw a star with its opacity', () => {
    // action
    drawPdfSimpleShape(page, star, {}, bounds, states);

    // result
    expect(drawPdfStarShapeMock).toHaveBeenCalledWith(page, star, 1, bounds, states);
  });
});
