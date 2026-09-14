// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawActiveGradientRotateAngleLabel } from '../drawActiveGradientRotateAngleLabel';

const drawGradientRotateAngleLabelMock = vi.fn();

vi.mock('../drawGradientRotateAngleLabel', () => ({
  drawGradientRotateAngleLabel: (...args: unknown[]): void => drawGradientRotateAngleLabelMock(...args),
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
const START = { x: 0, y: 50 };
const END = { x: 100, y: 50 };

describe('drawActiveGradientRotateAngleLabel', () => {
  beforeEach(() => {
    drawGradientRotateAngleLabelMock.mockClear();
  });

  it('should draw nothing when no endpoint is hovered or dragged', () => {
    // before
    drawActiveGradientRotateAngleLabel(CONTEXT, START, END, false, null, createCanvasRefs());

    // result
    expect(drawGradientRotateAngleLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the label at the hovered endpoint pointer position', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientRotateEndpointRef.current = { endpoint: 'start', pointerPosition: { x: 20, y: 30 } };

    // action
    drawActiveGradientRotateAngleLabel(CONTEXT, START, END, false, null, refs);

    // result
    expect(drawGradientRotateAngleLabelMock).toHaveBeenCalledWith(CONTEXT, { x: 20, y: 30 }, START, END);
  });

  it('should draw the label from the drag state pointer position when rotating this paint, taking priority over the hover ref', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientRotateEndpointRef.current = { endpoint: 'start', pointerPosition: { x: 20, y: 30 } };

    const rotateDragState = {
      angleOffset: 0,
      draggedEndpoint: 'end' as const,
      mode: 'box' as const,
      nodeId: 'rect-1',
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 40, y: 60 },
      radius: 50,
    };

    // action
    drawActiveGradientRotateAngleLabel(CONTEXT, START, END, true, rotateDragState, refs);

    // result
    expect(drawGradientRotateAngleLabelMock).toHaveBeenCalledWith(CONTEXT, { x: 40, y: 60 }, START, END);
  });

  it('should ignore the drag state pointer position when it belongs to a different paint', () => {
    // before
    const rotateDragState = {
      angleOffset: 0,
      draggedEndpoint: 'end' as const,
      mode: 'box' as const,
      nodeId: 'rect-1',
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 40, y: 60 },
      radius: 50,
    };

    // action — isRotatingThisPaint is false, so the drag state must be ignored
    drawActiveGradientRotateAngleLabel(CONTEXT, START, END, false, rotateDragState, createCanvasRefs());

    // result
    expect(drawGradientRotateAngleLabelMock).not.toHaveBeenCalled();
  });
});
