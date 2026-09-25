// types
import { EffectType, NodeType, StrokeAlign } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TEllipseNode } from 'types/design/types';

// utils
import { drawEllipseLeafNode } from '../drawEllipseLeafNode';

const drawBoxPaintsMock = vi.fn();
const drawBooleanEffectsMock = vi.fn();
const drawThickEllipseOutlineMock = vi.fn();

vi.mock('../../drawBoxLeafNode/drawBoxPaints', () => ({ drawBoxPaints: (...args: unknown[]): void => drawBoxPaintsMock(...args) }));
vi.mock('../../drawBooleanLeafNode/drawBooleanEffects', () => ({
  drawBooleanEffects: (...args: unknown[]): void => drawBooleanEffectsMock(...args),
}));
vi.mock('utils/canvas/shapes/drawThickEllipseOutline', () => ({
  drawThickEllipseOutline: (...args: unknown[]): void => drawThickEllipseOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const refs = {} as TCanvasRefs;
const pathOutlineStyles = new Map();
const context = { buffer, canvasHeight: 150, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as TDrawSceneContext;
const fills = [{ color: '#ffffff', opacity: 100, type: 'solid' as const }];

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fills,
  height: 20,
  id: 'e1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

const draw = (node: TEllipseNode): void => drawEllipseLeafNode(context, node, 0.5, {}, pathOutlineStyles, refs, null, 0);

describe('drawEllipseLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the fill paints over the ellipse shape between the shadow and the inner effects', () => {
    // mock
    const node = ellipse();

    // action
    draw(node);

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledWith(context, node, fills, [expect.any(Array)], 0.5, {}, pathOutlineStyles, refs, null, 0);
    expect(drawBooleanEffectsMock.mock.calls.map((call) => call[5])).toEqual([
      EffectType.dropShadow,
      EffectType.innerShadow,
      EffectType.noise,
    ]);
    expect(drawThickEllipseOutlineMock).not.toHaveBeenCalled();
  });

  it('should reuse the same shape for the same node', () => {
    // mock
    const node = ellipse();

    // action
    draw(node);
    draw(node);

    // result
    expect(drawBoxPaintsMock.mock.calls[0][3]).toBe(drawBoxPaintsMock.mock.calls[1][3]);
  });

  it('should draw the outline in the first visible stroke color when the ellipse has a stroke width', () => {
    // mock
    const node = ellipse({ strokeAlign: StrokeAlign.inside, strokeWidth: 3, strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }] });

    // action
    draw(node);

    // result
    expect(drawThickEllipseOutlineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      node,
      '#00ff00',
      3,
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
      StrokeAlign.inside,
    );
  });

  it('should skip the outline without a stroke width', () => {
    // action
    draw(ellipse({ strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }));

    // result
    expect(drawThickEllipseOutlineMock).not.toHaveBeenCalled();
  });
});
