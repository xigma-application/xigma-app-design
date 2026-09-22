import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { drawPdfVectorNodeShape } from '../drawPdfVectorNodeShape';

const drawPdfVectorFillsMock = vi.fn();
const drawPdfVectorStrokeMock = vi.fn();
const drawPdfVectorRoundedCapsMock = vi.fn();

vi.mock('../drawPdfVectorFills', () => ({ drawPdfVectorFills: (...args: unknown[]): void => drawPdfVectorFillsMock(...args) }));
vi.mock('../drawPdfVectorStroke', () => ({ drawPdfVectorStroke: (...args: unknown[]): void => drawPdfVectorStrokeMock(...args) }));
vi.mock('../drawPdfVectorRoundedCaps', () => ({
  drawPdfVectorRoundedCaps: (...args: unknown[]): void => drawPdfVectorRoundedCapsMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('drawPdfVectorNodeShape', () => {
  beforeEach(() => {
    drawPdfVectorFillsMock.mockClear();
    drawPdfVectorStrokeMock.mockClear();
    drawPdfVectorRoundedCapsMock.mockClear();
  });

  it('should draw fills, stroke and rounded caps in order with the effective opacity', () => {
    // action
    drawPdfVectorNodeShape(page, node, {}, bounds, states);

    // result
    expect(drawPdfVectorFillsMock).toHaveBeenCalledWith(page, node, 1, bounds, states);
    expect(drawPdfVectorStrokeMock).toHaveBeenCalledWith(page, node, 1, bounds, states);
    expect(drawPdfVectorRoundedCapsMock).toHaveBeenCalledWith(page, node, 1, bounds, states);
  });

  it('should multiply in the inherited ancestor opacity', () => {
    // mock
    const parent: TFrameNode = {
      childIds: ['v'],
      clipContent: false,
      fills: [],
      height: 100,
      id: 'p',
      name: 'p',
      opacity: 0.5,
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    };

    // action
    drawPdfVectorNodeShape(page, { ...node, parentId: 'p' }, { p: parent }, bounds, states);

    // result
    expect(drawPdfVectorFillsMock.mock.calls[0][2]).toBeCloseTo(0.5);
  });
});
