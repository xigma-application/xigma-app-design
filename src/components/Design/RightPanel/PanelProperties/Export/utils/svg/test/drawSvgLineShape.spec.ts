// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { drawSvgLineShape } from '../drawSvgLineShape';

const drawSvgPolygonsMock = vi.fn();

vi.mock('../drawSvgPolygons', () => ({ drawSvgPolygons: (...args: unknown[]): void => drawSvgPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

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

describe('drawSvgLineShape', () => {
  beforeEach(() => {
    drawSvgPolygonsMock.mockClear();
  });

  it('should draw a plain line as a single quad polygon', () => {
    drawSvgLineShape([], line(), {}, bounds);

    expect(drawSvgPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawSvgPolygonsMock.mock.calls[0][1]).toHaveLength(1);
    expect(drawSvgPolygonsMock.mock.calls[0][1][0]).toHaveLength(4);
    expect(drawSvgPolygonsMock.mock.calls[0][2]).toBe('#ff0000');
    expect(drawSvgPolygonsMock.mock.calls[0][3]).toBe(1);
  });

  it('should skip a zero-length line', () => {
    drawSvgLineShape([], line({ x2: 0 }), {}, bounds);

    expect(drawSvgPolygonsMock.mock.calls[0][1]).toEqual([[]]);
  });

  it('should add arrowhead polygons at each end that has an arrow style', () => {
    drawSvgLineShape([], line({ endPoint: 'arrow', startPoint: 'arrow' }), {}, bounds);

    expect(drawSvgPolygonsMock.mock.calls[0][1]).toHaveLength(11);
  });

  it('should multiply in the inherited ancestor opacity', () => {
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

    drawSvgLineShape([], line({ parentId: 'p' }), { p: parent }, bounds);

    expect(drawSvgPolygonsMock.mock.calls[0][3]).toBeCloseTo(0.5);
  });

  it('should default the stroke width when the node has none', () => {
    drawSvgLineShape([], line({ strokeWidth: undefined }), {}, bounds);

    expect(drawSvgPolygonsMock.mock.calls[0][1][0][0].y).toBeCloseTo(0.5);
  });
});
