import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { drawPdfPolygonShape } from '../drawPdfPolygonShape';

const drawPdfPolygonsMock = vi.fn();

vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fill: '#ff0000',
  flipX: false,
  flipY: false,
  height: 20,
  id: 'p',
  name: 'p',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawPdfPolygonShape', () => {
  beforeEach(() => {
    drawPdfPolygonsMock.mockClear();
  });

  it('should draw the fill polygon with the given opacity', () => {
    // action
    drawPdfPolygonShape(page, polygon(), 0.5, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonsMock.mock.calls[0][2]).toBe('#ff0000');
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBe(0.5);
    expect(drawPdfPolygonsMock.mock.calls[0][1]).toHaveLength(1);
    expect(drawPdfPolygonsMock.mock.calls[0][1][0]).toHaveLength(5);
  });

  it('should facet the corners when there is a corner radius', () => {
    // action
    drawPdfPolygonShape(page, polygon({ cornerRadius: 2 }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][1][0].length).toBeGreaterThan(5);
  });

  it('should skip drawing when the fill is empty', () => {
    // action
    drawPdfPolygonShape(page, polygon({ fill: '' }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });
});
