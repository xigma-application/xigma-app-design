// types
import { NodeType } from 'types/design/enums';
import { TGradientPaint } from 'types/design/paint/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawGradientRadiusHandles } from '../drawGradientRadiusHandles';

const drawGradientEndpointHandlesMock = vi.fn();
const drawGradientRadiusGuideMock = vi.fn();

vi.mock('../drawGradientEndpointHandles', () => ({
  drawGradientEndpointHandles: (...args: unknown[]): void => drawGradientEndpointHandlesMock(...args),
}));
vi.mock('../drawGradientRadiusGuide', () => ({
  drawGradientRadiusGuide: (...args: unknown[]): void => drawGradientRadiusGuideMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const CONTEXT = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const START = { x: 0, y: 50 };
const GRADIENT_EDITOR = { nodeId: 'rect-1', paintIndex: 0, selectedStopIndex: null };

const rectangleNode = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const RADIAL_PAINT: TGradientPaint = {
  end: { x: 1, y: 0.5 },
  opacity: 100,
  start: { x: 0, y: 0.5 },
  stops: [{ color: '#ffffff', opacity: 100, position: 0 }],
  type: 'gradient-radial',
};

const LINEAR_PAINT: TGradientPaint = { ...RADIAL_PAINT, type: 'gradient-linear' };

describe('drawGradientRadiusHandles', () => {
  beforeEach(() => {
    drawGradientEndpointHandlesMock.mockClear();
    drawGradientRadiusGuideMock.mockClear();
  });

  it('should draw nothing for a linear gradient, which has no radius handle at all', () => {
    // before
    drawGradientRadiusHandles(CONTEXT, BOUNDS, rectangleNode(), LINEAR_PAINT, START, GRADIENT_EDITOR, createCanvasRefs());

    // result
    expect(drawGradientEndpointHandlesMock).not.toHaveBeenCalled();
    expect(drawGradientRadiusGuideMock).not.toHaveBeenCalled();
  });

  it('should draw a lone endpoint handle at the radius handle world point for a radial gradient', () => {
    // before — a square node, no rotation: the primary-radius handle sits perpendicular, at world (0, 150)
    drawGradientRadiusHandles(CONTEXT, BOUNDS, rectangleNode(), RADIAL_PAINT, START, GRADIENT_EDITOR, createCanvasRefs());

    // result
    expect(drawGradientEndpointHandlesMock).toHaveBeenCalledTimes(1);

    const [, radiusHandlePoints] = drawGradientEndpointHandlesMock.mock.calls[0];

    expect(radiusHandlePoints).toEqual([{ x: 0, y: 150 }]);
  });

  it('should not draw the radius guide when the radius handle is not being dragged', () => {
    // before
    drawGradientRadiusHandles(CONTEXT, BOUNDS, rectangleNode(), RADIAL_PAINT, START, GRADIENT_EDITOR, createCanvasRefs());

    // result
    expect(drawGradientRadiusGuideMock).not.toHaveBeenCalled();
  });

  it('should draw the radius guide from the center to the handle while the radius handle is being dragged', () => {
    // before
    const refs = createCanvasRefs();

    refs.gradientRadius.gradientRadiusDragRef.current = { nodeId: 'rect-1', paintIndex: 0 };

    // action
    drawGradientRadiusHandles(CONTEXT, BOUNDS, rectangleNode(), RADIAL_PAINT, START, GRADIENT_EDITOR, refs);

    // result — the guide runs from whatever start point the caller passed in to the radius handle
    expect(drawGradientRadiusGuideMock).toHaveBeenCalledTimes(1);
    expect(drawGradientRadiusGuideMock).toHaveBeenCalledWith(CONTEXT, START, { x: 0, y: 150 });
  });

  it('should ignore a radius drag ref belonging to a different node or paint index', () => {
    // before
    const refs = createCanvasRefs();

    refs.gradientRadius.gradientRadiusDragRef.current = { nodeId: 'other-node', paintIndex: 0 };

    // action
    drawGradientRadiusHandles(CONTEXT, BOUNDS, rectangleNode(), RADIAL_PAINT, START, GRADIENT_EDITOR, refs);

    // result
    expect(drawGradientRadiusGuideMock).not.toHaveBeenCalled();
  });
});
