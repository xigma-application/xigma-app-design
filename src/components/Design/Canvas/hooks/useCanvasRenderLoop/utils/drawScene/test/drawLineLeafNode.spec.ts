// types
import { EffectType, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../types';
import { TLineNode } from 'types/design/types';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { drawLineLeafNode } from '../drawLineLeafNode';
import { getLineShape } from '../getLineShape';
import { getLineStrokeBox } from 'utils/canvas/shapes/getLineStrokeBox';
import { getLineStrokePolygon } from 'utils/canvas/shapes/getLineStrokePolygon';

const drawBoxPaintsMock = vi.fn();
const drawBooleanEffectsMock = vi.fn();

vi.mock('../drawBoxLeafNode/drawBoxPaints', () => ({
  drawBoxPaints: (...args: unknown[]): unknown => drawBoxPaintsMock(...args),
}));

vi.mock('../drawBooleanLeafNode/drawBooleanEffects', () => ({
  drawBooleanEffects: (...args: unknown[]): unknown => drawBooleanEffectsMock(...args),
}));

const context = { gl: {} } as TDrawSceneContext;

const line = (overrides: Partial<TLineNode> = {}): TLineNode => ({
  height: 0,
  id: 'l1',
  name: 'Line',
  parentId: null,
  rotation: 0,
  strokes: [{ color: '#222222', opacity: 100, type: 'solid' }],
  type: NodeType.line,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawLineLeafNode', () => {
  beforeEach(() => {
    drawBoxPaintsMock.mockClear();
    drawBooleanEffectsMock.mockClear();
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

  it('should draw the drop shadows under the stroke and the inner shadows and noise over it', () => {
    // mock
    const node = line();
    const refs = createCanvasRefs();
    const shape = getLineShape(getLineStrokePolygon(node) ?? []);

    // action
    drawLineLeafNode(context, node, 0.5, {}, new Map(), refs, null, 0);

    // result
    expect(drawBooleanEffectsMock.mock.calls).toEqual([
      [context, node, shape, 0.5, refs, EffectType.dropShadow],
      [context, node, shape, 0.5, refs, EffectType.innerShadow],
      [context, node, shape, 0.5, refs, EffectType.noise],
    ]);
  });

  it('should draw nothing for a zero-length line', () => {
    // action
    drawLineLeafNode(context, line({ width: 0 }), 1, {}, new Map(), createCanvasRefs(), null, 0);

    // result
    expect(drawBoxPaintsMock).not.toHaveBeenCalled();
    expect(drawBooleanEffectsMock).not.toHaveBeenCalled();
  });
});
