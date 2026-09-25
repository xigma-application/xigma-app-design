// types
import { BooleanOperation, NodeType, StrokeMode } from 'types/design/enums';
import { TBooleanNode } from 'types/design/types';
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { drawBooleanStrokePaints } from '../drawBooleanStrokePaints';
import { getBooleanStrokeModePolygons } from '../getBooleanStrokeModePolygons';
import { getBooleanStrokeRings } from '../getBooleanStrokeRings';

const drawBoxPaintsMock = vi.fn();

vi.mock('../../drawBoxLeafNode/drawBoxPaints', () => ({
  drawBoxPaints: (...args: unknown[]): unknown => drawBoxPaintsMock(...args),
}));

const gradientStroke = {
  end: { x: 1, y: 0.5 },
  opacity: 100,
  start: { x: 0, y: 0.5 },
  stops: [
    { color: '#ffffff', opacity: 100, position: 0 },
    { color: '#000000', opacity: 100, position: 1 },
  ],
  type: 'gradient-linear' as const,
};

const node: TBooleanNode = {
  booleanOperation: BooleanOperation.union,
  childIds: [],
  fills: [],
  height: 10,
  id: 'union',
  name: 'Union',
  parentId: null,
  rotation: 0,
  strokeWidth: 4,
  strokes: [gradientStroke],
  type: NodeType.boolean,
  width: 10,
  x: 0,
  y: 0,
};

const context = { gl: {} } as TDrawSceneContext;

describe('drawBooleanStrokePaints', () => {
  beforeEach(() => {
    drawBoxPaintsMock.mockClear();
  });

  it('should paint every stroke paint, gradients included, over the stroke ring of each loop', () => {
    // action
    drawBooleanStrokePaints(context, node, booleanShape, 0.5, {}, new Map(), createCanvasRefs(), null, 1);

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledTimes(1);
    expect(drawBoxPaintsMock).toHaveBeenCalledWith(
      context,
      { ...booleanShape.bounds, rotation: 0 },
      [gradientStroke],
      getBooleanStrokeRings(booleanShape, 4)[0],
      0.5,
      {},
      expect.any(Map),
      expect.anything(),
      null,
      1,
      null,
      'nonZero',
    );
  });

  it('should use a 1px stroke when the boolean has no stroke width', () => {
    // action
    drawBooleanStrokePaints(context, { ...node, strokeWidth: undefined }, booleanShape, 1, {}, new Map(), createCanvasRefs(), null, 0);

    // result
    expect(drawBoxPaintsMock.mock.calls[0][3]).toBe(getBooleanStrokeRings(booleanShape, 1)[0]);
  });

  it('should draw nothing without strokes or with a zero stroke width', () => {
    // action
    drawBooleanStrokePaints(context, { ...node, strokes: [] }, booleanShape, 1, {}, new Map(), createCanvasRefs(), null, 0);
    drawBooleanStrokePaints(context, { ...node, strokes: undefined }, booleanShape, 1, {}, new Map(), createCanvasRefs(), null, 0);
    drawBooleanStrokePaints(context, { ...node, strokeWidth: 0 }, booleanShape, 1, {}, new Map(), createCanvasRefs(), null, 0);

    // result
    expect(drawBoxPaintsMock).not.toHaveBeenCalled();
  });

  it('should paint a dynamic stroke once over its wiggled rings', () => {
    // mock
    const dynamic = { ...node, strokeMode: StrokeMode.dynamic };

    // action
    drawBooleanStrokePaints(context, dynamic, booleanShape, 1, {}, new Map(), createCanvasRefs(), null, 0);

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledTimes(1);
    expect(drawBoxPaintsMock.mock.calls[0][3]).toBe(getBooleanStrokeModePolygons(dynamic, booleanShape, 4));
    expect(drawBoxPaintsMock.mock.calls[0]).toHaveLength(10);
  });
});
