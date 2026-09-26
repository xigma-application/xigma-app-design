import { PDFName } from 'pdf-lib';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { drawPdfVectorRoundedCaps } from '../drawPdfVectorRoundedCaps';

const drawPdfPolygonsMock = vi.fn();

vi.mock('../drawPdfPolygons', () => ({ drawPdfPolygons: (...args: unknown[]): void => drawPdfPolygonsMock(...args) }));

const bounds = { height: 100, width: 100, x: 0, y: 0 };
const page = {} as never;
const states = new Map<number, PDFName>();

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

describe('drawPdfVectorRoundedCaps', () => {
  beforeEach(() => {
    drawPdfPolygonsMock.mockClear();
  });

  it('should draw a circle at each open endpoint when capStyle is round', () => {
    // action
    drawPdfVectorRoundedCaps(page, node({ capStyle: 'round' }), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).toHaveBeenCalledTimes(1);
    expect(drawPdfPolygonsMock.mock.calls[0][1]).toHaveLength(2);
    expect(drawPdfPolygonsMock.mock.calls[0][2]).toBe('#000000');
    expect(drawPdfPolygonsMock.mock.calls[0][3]).toBe(1);
  });

  it('should draw nothing when capStyle is not round', () => {
    // action
    drawPdfVectorRoundedCaps(page, node(), 1, bounds, states);

    // result
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a closed path with no open endpoints', () => {
    // action
    drawPdfVectorRoundedCaps(
      page,
      node({
        capStyle: 'round',
        segments: {
          s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
          s2: { endId: 'a', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        },
      }),
      1,
      bounds,
      states,
    );

    // result
    expect(drawPdfPolygonsMock).not.toHaveBeenCalled();
  });
});
