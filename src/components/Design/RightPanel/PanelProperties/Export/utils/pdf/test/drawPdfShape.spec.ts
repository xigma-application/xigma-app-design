import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { drawPdfShape } from '../drawPdfShape';

const drawPdfPolygonsMock = vi.fn();

vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

const rectangle = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 20,
  id: 'r',
  name: 'r',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawPdfShape', () => {
  beforeEach(() => {
    drawPdfPolygonsMock.mockClear();
  });

  it('should draw the fill with the paint opacity as a fraction', () => {
    // action
    drawPdfShape(page, rectangle({ fills: [{ color: '#00ff00', opacity: 40, type: 'solid' }] }), {}, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonsMock.mock.calls[0][2]).toBe('#00ff00');
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBeCloseTo(0.4);
    expect(drawPdfPolygonsMock.mock.calls[0][1]).toHaveLength(1);
  });

  it('should draw stacked fills bottom to top and skip hidden and non-solid paints', () => {
    // action
    drawPdfShape(
      page,
      rectangle({
        fills: [
          { color: '#111111', opacity: 100, type: 'solid' },
          { color: '#222222', opacity: 100, type: 'solid', visible: false },
          { opacity: 100, ref: 'i', rotation: 0, scaleMode: 'fill', type: 'image' },
          { color: '#333333', opacity: 100, type: 'solid' },
        ],
      }),
      {},
      bounds,
      states,
    );

    // result
    expect(drawPdfPolygonsMock.mock.calls.map((call) => call[2])).toEqual(['#333333', '#111111']);
  });

  it('should multiply in the inherited opacity of the ancestors', () => {
    // mock
    const parent: TFrameNode = {
      childIds: ['r'],
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
    drawPdfShape(page, rectangle({ parentId: 'p' }), { p: parent }, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBeCloseTo(0.5);
  });

  it('should draw the stroke rings after the fill when the node has a stroke', () => {
    // action
    drawPdfShape(page, rectangle({ strokeWidth: 2, strokes: [{ color: '#0000ff', opacity: 100, type: 'solid' }] }), {}, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(2);
    expect(drawPdfPolygonsMock.mock.calls[1][2]).toBe('#0000ff');
    expect(drawPdfPolygonsMock.mock.calls[1][1].length).toBeGreaterThanOrEqual(2);
  });
});
