import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { drawPdfLineShape } from '../drawPdfLineShape';

const drawPdfPolygonsMock = vi.fn();

vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  id: 'l',
  name: 'l',
  parentId: null,
  stroke: '#ff0000',
  type: NodeType.line,
  x1: 0,
  x2: 20,
  y1: 0,
  y2: 0,
  ...overrides,
});

describe('drawPdfLineShape', () => {
  beforeEach(() => {
    drawPdfPolygonsMock.mockClear();
  });

  it('should draw a plain line as a single quad polygon', () => {
    // action
    drawPdfLineShape(page, line(), {}, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonsMock.mock.calls[0][1]).toHaveLength(1);
    expect(drawPdfPolygonsMock.mock.calls[0][1][0]).toHaveLength(4);
    expect(drawPdfPolygonsMock.mock.calls[0][2]).toBe('#ff0000');
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBe(1);
  });

  it('should skip a zero-length line', () => {
    // action
    drawPdfLineShape(page, line({ x2: 0 }), {}, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][1]).toEqual([[]]);
  });

  it('should add arrowhead polygons at each end that has an arrow style', () => {
    // action
    drawPdfLineShape(page, line({ endPoint: 'arrow', startPoint: 'arrow' }), {}, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][1]).toHaveLength(11);
  });

  it('should multiply in the inherited ancestor opacity', () => {
    // mock
    const parent: TFrameNode = {
      childIds: ['l'],
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
    drawPdfLineShape(page, line({ parentId: 'p' }), { p: parent }, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBeCloseTo(0.5);
  });

  it('should default the stroke width when the node has none', () => {
    // action
    drawPdfLineShape(page, line({ strokeWidth: undefined }), {}, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][1][0][0].y).toBeCloseTo(0.5);
  });
});
