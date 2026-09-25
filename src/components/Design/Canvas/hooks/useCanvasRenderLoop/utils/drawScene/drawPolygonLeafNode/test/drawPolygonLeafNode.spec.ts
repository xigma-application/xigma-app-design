// types
import { EffectType, NodeType, StrokeAlign } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TPolygonNode } from 'types/design/types';

// utils
import { drawPolygonLeafNode } from '../drawPolygonLeafNode';

const drawBoxPaintsMock = vi.fn();
const drawBooleanEffectsMock = vi.fn();

vi.mock('../../drawBoxLeafNode/drawBoxPaints', () => ({ drawBoxPaints: (...args: unknown[]): void => drawBoxPaintsMock(...args) }));
vi.mock('../../drawBooleanLeafNode/drawBooleanEffects', () => ({
  drawBooleanEffects: (...args: unknown[]): void => drawBooleanEffectsMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const refs = {} as TCanvasRefs;
const pathOutlineStyles = new Map();
const context = { buffer, canvasHeight: 150, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as TDrawSceneContext;
const fills = [{ color: '#ffffff', opacity: 100, type: 'solid' as const }];

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fills,
  flipX: false,
  flipY: false,
  height: 20,
  id: 'p1',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const draw = (node: TPolygonNode): void => drawPolygonLeafNode(context, node, 0.5, {}, pathOutlineStyles, refs, null, 0);

describe('drawPolygonLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the fill paints over the polygon shape between the shadow and the inner effects', () => {
    // mock
    const node = polygon();

    // action
    draw(node);

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledWith(context, node, fills, [expect.any(Array)], 0.5, {}, pathOutlineStyles, refs, null, 0);
    expect(drawBooleanEffectsMock.mock.calls.map((call) => call[5])).toEqual([
      EffectType.dropShadow,
      EffectType.innerShadow,
      EffectType.noise,
    ]);
    expect(drawBoxPaintsMock).toHaveBeenCalledTimes(1);
  });

  it('should reuse the same shape for the same node', () => {
    // mock
    const node = polygon();

    // action
    draw(node);
    draw(node);

    // result
    expect(drawBoxPaintsMock.mock.calls[0][3]).toBe(drawBoxPaintsMock.mock.calls[1][3]);
  });

  it('should draw the stroke paints over the stroke shape after the inner shadow and before the noise', () => {
    // mock
    const strokes = [{ color: '#00ff00', opacity: 100, type: 'solid' as const }];
    const node = polygon({ strokeAlign: StrokeAlign.inside, strokeWidth: 3, strokes });

    // action
    draw(node);

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledTimes(2);
    expect(drawBoxPaintsMock.mock.calls[1]).toEqual([
      context,
      node,
      strokes,
      expect.any(Array),
      0.5,
      {},
      pathOutlineStyles,
      refs,
      null,
      0,
      null,
      'evenOdd',
    ]);
  });

  it('should skip the stroke without a stroke width or without stroke paints', () => {
    // action
    draw(polygon({ strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }));
    draw(polygon({ strokeWidth: 3 }));

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledTimes(2);
  });
});
