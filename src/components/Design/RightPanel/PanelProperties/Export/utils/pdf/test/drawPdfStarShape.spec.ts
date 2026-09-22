import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';

// utils
import { drawPdfStarShape } from '../drawPdfStarShape';

const drawPdfPolygonsMock = vi.fn();

vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

const star = (overrides: Partial<TStarNode> = {}): TStarNode => ({
  fill: '#00ff00',
  flipX: false,
  flipY: false,
  height: 20,
  id: 's',
  name: 's',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawPdfStarShape', () => {
  beforeEach(() => {
    drawPdfPolygonsMock.mockClear();
  });

  it('should draw the fill polygon with the given opacity', () => {
    // action
    drawPdfStarShape(page, star(), 0.75, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonsMock.mock.calls[0][2]).toBe('#00ff00');
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBe(0.75);
    expect(drawPdfPolygonsMock.mock.calls[0][1][0]).toHaveLength(10);
  });

  it('should facet the corners when there is a corner radius', () => {
    // action
    drawPdfStarShape(page, star({ cornerRadius: 2 }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][1][0].length).toBeGreaterThan(10);
  });

  it('should skip drawing when the fill is empty', () => {
    // action
    drawPdfStarShape(page, star({ fill: '' }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });
});
