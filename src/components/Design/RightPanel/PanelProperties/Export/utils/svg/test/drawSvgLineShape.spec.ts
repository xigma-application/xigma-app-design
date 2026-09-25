// types
import { LineEndpoint, NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode } from 'types/design/types';

// utils
import { drawSvgLineShape } from '../drawSvgLineShape';

const drawSvgPolygonsMock = vi.fn();

vi.mock('../drawSvgPolygons', () => ({ drawSvgPolygons: (...args: unknown[]): void => drawSvgPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  height: 0,
  id: 'l',
  name: 'l',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 20,
  x: 0,
  y: 0,
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

  it('should draw nothing for a zero-length line', () => {
    drawSvgLineShape([], line({ width: 0 }), {}, bounds);

    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });

  it('should draw one outline polygon wrapping the arrowheads at each end that has an arrow style', () => {
    drawSvgLineShape([], line({ endPoint: LineEndpoint.lineArrow, startPoint: LineEndpoint.lineArrow }), {}, bounds);

    expect(drawSvgPolygonsMock.mock.calls[0][1]).toHaveLength(1);
    expect(drawSvgPolygonsMock.mock.calls[0][1][0]).toHaveLength(14);
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

  it('should draw nothing when the line has no single solid stroke', () => {
    // action
    drawSvgLineShape([], line({ strokes: [{ opacity: 100, stops: [], type: 'gradient-linear' } as never] }), {}, bounds);

    // result
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });
});
