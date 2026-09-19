// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawBoxLeafNodeStrokePaints } from '../drawBoxLeafNodeStrokePaints';

const drawBoxPaintsMock = vi.fn();
const getBoxStrokeRingPolygonsMock = vi.fn();

vi.mock('../drawBoxPaints', () => ({ drawBoxPaints: (...args: unknown[]): void => drawBoxPaintsMock(...args) }));
vi.mock('../../getBoxStrokeRingPolygons', () => ({
  getBoxStrokeRingPolygons: (...args: unknown[]): unknown => getBoxStrokeRingPolygonsMock(...args),
}));

const context = {} as TDrawSceneContext;
const refs = createCanvasRefs();
const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 20,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawBoxLeafNodeStrokePaints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBoxStrokeRingPolygonsMock.mockReturnValue([[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]]);
  });

  it('should draw the stroke paints inside the ring polygons', () => {
    // mock
    const node = rect({ strokeAlign: StrokeAlign.outside, strokeWidth: 2, strokes: [{ color: '#f00', opacity: 100, type: 'solid' }] });

    // action
    drawBoxLeafNodeStrokePaints(context, node, 0.5, {}, new Map(), refs, null, 0);

    // result
    expect(getBoxStrokeRingPolygonsMock).toHaveBeenCalledWith(node);
    expect(drawBoxPaintsMock).toHaveBeenCalledWith(
      context,
      node,
      node.strokes,
      [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }]],
      0.5,
      {},
      expect.any(Map),
      refs,
      null,
      0,
    );
  });

  it('should draw nothing without strokes, with an empty list, or without a stroke width', () => {
    // action
    drawBoxLeafNodeStrokePaints(context, rect({ strokeWidth: 2 }), 1, {}, new Map(), refs, null, 0);
    drawBoxLeafNodeStrokePaints(context, rect({ strokeWidth: 2, strokes: [] }), 1, {}, new Map(), refs, null, 0);
    drawBoxLeafNodeStrokePaints(
      context,
      rect({ strokes: [{ color: '#f00', opacity: 100, type: 'solid' }] }),
      1,
      {},
      new Map(),
      refs,
      null,
      0,
    );

    // result
    expect(drawBoxPaintsMock).not.toHaveBeenCalled();
  });
});
