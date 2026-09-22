import { PDFName } from 'pdf-lib';

// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawPdfEllipseShape } from '../drawPdfEllipseShape';

const drawPdfPolygonsMock = vi.fn();

vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ff0000',
  height: 20,
  id: 'e',
  name: 'e',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawPdfEllipseShape', () => {
  beforeEach(() => {
    drawPdfPolygonsMock.mockClear();
  });

  it('should draw a full ellipse as one closed loop of the ellipse segment count', () => {
    // action
    drawPdfEllipseShape(page, ellipse(), 0.5, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonsMock.mock.calls[0][2]).toBe('#ff0000');
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBe(0.5);
    expect(drawPdfPolygonsMock.mock.calls[0][1]).toHaveLength(1);
    expect(drawPdfPolygonsMock.mock.calls[0][1][0]).toHaveLength(64);
  });

  it('should draw an arc as a fan from the center', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ arcEndAngle: 180, arcStartAngle: 0 }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][1][0]).toHaveLength(34);
  });

  it('should draw a donut arc as an outer/inner ring outline', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ arcEndAngle: 180, arcRatio: 0.5, arcStartAngle: 0 }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock.mock.calls[0][1][0]).toHaveLength(66);
  });

  it('should skip the fill draw when there is no fill color', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ fill: '' }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });

  it('should draw a full-ellipse stroke ring after the fill regardless of an arc', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ strokeColor: '#0000ff', strokeWidth: 4 }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(2);
    expect(drawPdfPolygonsMock.mock.calls[1][2]).toBe('#0000ff');
    expect(drawPdfPolygonsMock.mock.calls[1][1]).toHaveLength(2);
    expect(drawPdfPolygonsMock.mock.calls[1][1][0]).toHaveLength(64);
    expect(drawPdfPolygonsMock.mock.calls[1][1][1]).toHaveLength(64);
  });

  it('should respect the stroke align when insetting the ring', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ strokeAlign: StrokeAlign.inside, strokeColor: '#0000ff', strokeWidth: 4 }), 1, bounds, states);

    // result
    const [outerPoints, innerPoints] = drawPdfPolygonsMock.mock.calls[1][1];

    expect(outerPoints[0].x).toBeCloseTo(20);
    expect(innerPoints[0].x).toBeCloseTo(16);
  });

  it('should skip the stroke draw when there is no stroke color or width', () => {
    // action
    drawPdfEllipseShape(page, ellipse({ strokeColor: '#0000ff' }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
  });
});
