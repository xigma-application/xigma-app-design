// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TLineNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { drawLineLeafNode } from '../drawLineLeafNode';
import { getLineStrokeBox } from 'utils/canvas/shapes/getLineStrokeBox';
import { getLineStrokePolygon } from 'utils/canvas/shapes/getLineStrokePolygon';

const drawBoxPaintsMock = vi.fn();

vi.mock('../drawBoxLeafNode/drawBoxPaints', () => ({
  drawBoxPaints: (...args: unknown[]): unknown => drawBoxPaintsMock(...args),
}));

const context = { gl: {} } as TDrawSceneContext;

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  id: 'l1',
  name: 'Line',
  parentId: null,
  strokes: [{ color: '#222222', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  x1: 0,
  x2: 10,
  y1: 0,
  y2: 0,
  ...overrides,
});

describe('drawLineLeafNode', () => {
  beforeEach(() => {
    drawBoxPaintsMock.mockClear();
  });

  it('should paint the stroke paints over the line outline, laid out along the line', () => {
    // mock
    const node = line();
    const refs = createCanvasRefs();

    // action
    drawLineLeafNode(context, node, 0.5, {}, new Map(), refs, null, 1);

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledWith(
      context,
      getLineStrokeBox(node),
      node.strokes,
      [getLineStrokePolygon(node)],
      0.5,
      {},
      expect.any(Map),
      refs,
      null,
      1,
    );
  });

  it('should draw nothing for a zero-length line', () => {
    // action
    drawLineLeafNode(context, line({ x2: 0 }), 1, {}, new Map(), createCanvasRefs(), null, 0);

    // result
    expect(drawBoxPaintsMock).not.toHaveBeenCalled();
  });
});
