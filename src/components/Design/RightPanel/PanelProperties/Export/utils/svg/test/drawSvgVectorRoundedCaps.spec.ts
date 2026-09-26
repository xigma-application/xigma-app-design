// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawSvgVectorRoundedCaps } from '../drawSvgVectorRoundedCaps';

const drawSvgPolygonsMock = vi.fn();

vi.mock('../drawSvgPolygons', () => ({ drawSvgPolygons: (...args: unknown[]): void => drawSvgPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const node = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeWidth: 2,
  strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } },
  ...overrides,
});

describe('drawSvgVectorRoundedCaps', () => {
  beforeEach(() => {
    drawSvgPolygonsMock.mockClear();
  });

  it('should draw a circle at each open endpoint when capStyle is round', () => {
    // action
    drawSvgVectorRoundedCaps([], node({ capStyle: 'round' }), 1, bounds);

    // result
    expect(drawSvgPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawSvgPolygonsMock.mock.calls[0][1]).toHaveLength(2);
    expect(drawSvgPolygonsMock.mock.calls[0][2]).toBe('#000000');
    expect(drawSvgPolygonsMock.mock.calls[0][3]).toBe(1);
  });

  it('should draw nothing when capStyle is not round', () => {
    // action
    drawSvgVectorRoundedCaps([], node(), 1, bounds);

    // result
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a closed path with no open endpoints', () => {
    // action
    drawSvgVectorRoundedCaps(
      [],
      node({
        capStyle: 'round',
        segments: {
          s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
          s2: { endId: 'a', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        },
      }),
      1,
      bounds,
    );

    // result
    expect(drawSvgPolygonsMock).not.toHaveBeenCalled();
  });
});
