// types
import { NodeType } from 'types/design/enums';
import { TEllipseArcDragState, TEllipseArcRatioDragState, TEllipseArcRotateDragState } from 'types/design/canvas/types';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawEllipseArcHandleLayer } from '../drawEllipseArcHandleLayer';

const drawEllipseArcGuideLineMock = vi.fn();
const drawEllipseArcRatioGuideArcMock = vi.fn();
const drawEllipseArcHandleMock = vi.fn();
const drawHoveredEllipseArcValueLabelMock = vi.fn();

vi.mock('utils/canvas/drawEllipseArcGuideLine', () => ({
  drawEllipseArcGuideLine: (...args: unknown[]): void => drawEllipseArcGuideLineMock(...args),
}));
vi.mock('utils/canvas/drawEllipseArcRatioGuideArc', () => ({
  drawEllipseArcRatioGuideArc: (...args: unknown[]): void => drawEllipseArcRatioGuideArcMock(...args),
}));
vi.mock('utils/canvas/drawEllipseArcHandle', () => ({
  drawEllipseArcHandle: (...args: unknown[]): void => drawEllipseArcHandleMock(...args),
}));
vi.mock('../drawHoveredEllipseArcValueLabel', () => ({
  drawHoveredEllipseArcValueLabel: (...args: unknown[]): void => drawHoveredEllipseArcValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const ellipse = (overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#ff0000',
  height: 100,
  id: 'ellipse-1',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const rectangle: TRectangleNode = {
  fill: '#ff0000',
  height: 100,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 0,
  y: 0,
};

describe('drawEllipseArcHandleLayer', () => {
  beforeEach(() => {
    drawEllipseArcGuideLineMock.mockClear();
    drawEllipseArcRatioGuideArcMock.mockClear();
    drawEllipseArcHandleMock.mockClear();
    drawHoveredEllipseArcValueLabelMock.mockClear();
  });

  it('should draw nothing when nothing is selected', () => {
    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      null,
      [],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a multi-node selection', () => {
    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      null,
      [ellipse(), ellipse({ id: 'ellipse-2' })],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected node is not an ellipse', () => {
    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      null,
      [rectangle],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should draw nothing once the shape renders too small on screen', () => {
    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: {
          x: 0,
          y: 0,
          zoom: 0.9,
        },
      },
      null,
      [ellipse()],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
    expect(drawEllipseArcGuideLineMock).not.toHaveBeenCalled();
  });

  it('should draw only the fully-cut-away guide line when not hovered', () => {
    // mock — arcStartAngle defaults to 90; a full 360° lap cut (arcEndAngle 450) collapses majorSweep to 0
    const node = ellipse({ arcEndAngle: 450 });

    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      null,
      [node],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcGuideLineMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should not draw the fully-cut-away guide line for a normal partial cut', () => {
    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      null,
      [ellipse({ arcEndAngle: 0 })],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcGuideLineMock).not.toHaveBeenCalled();
  });

  it('should draw the ratio guide arc once arcRatio reaches its max on a genuinely cut shape', () => {
    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      null,
      [ellipse({ arcEndAngle: 0, arcRatio: 1 })],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcRatioGuideArcMock).toHaveBeenCalledTimes(1);
  });

  it('should not draw the ratio guide arc on a full circle even at max arcRatio', () => {
    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      null,
      [ellipse({ arcRatio: 1 })],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcRatioGuideArcMock).not.toHaveBeenCalled();
  });

  it('should not draw any handles when the shape is selected but not hovered', () => {
    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      null,
      [ellipse({ arcEndAngle: 0 })],
      createCanvasRefs(),
    );

    // result — drawHoveredEllipseArcValueLabel is still called unconditionally here; it owns the
    // hovered/dragging decision itself (see its own spec)
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should draw the Sweep and Ratio handles, but not the Start handle, on an uncut ellipse when hovered', () => {
    // mock
    const node = ellipse();

    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      node,
      [node],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcHandleMock).toHaveBeenCalledTimes(2);
  });

  it('should hand the Sweep handle value label off to drawHoveredEllipseArcValueLabel, which owns whether it actually draws', () => {
    // mock
    const node = ellipse({ arcEndAngle: 0, arcRatio: 0.4, rotation: 15 });
    const bounds = { height: 100, width: 100, x: 0, y: 0 };
    const refs = createCanvasRefs();

    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      node,
      [node],
      refs,
    );

    // result
    expect(drawHoveredEllipseArcValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawHoveredEllipseArcValueLabelMock).toHaveBeenCalledWith(expect.anything(), refs, bounds, 90, 0, 0.4, node, null);
  });

  it('should draw all three handles once a cut exists and the shape is hovered', () => {
    // mock
    const node = ellipse({ arcEndAngle: 0 });

    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      node,
      [node],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcHandleMock).toHaveBeenCalledTimes(3);
  });

  it('should draw only the Sweep handle on a fully cut-away shape, even when hovered', () => {
    // mock — both the Start (rotate) and Ratio handles hide in this state
    const node = ellipse({ arcEndAngle: 450 });

    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      node,
      [node],
      createCanvasRefs(),
    );

    // result
    expect(drawEllipseArcHandleMock).toHaveBeenCalledTimes(1);
  });

  it('should use the provided dragged positions instead of computing rest positions when given', () => {
    // mock
    const node = ellipse({ arcEndAngle: 0 });

    // before
    drawEllipseArcHandleLayer(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      node,
      [node],
      createCanvasRefs({
        ellipseArc: {
          ellipseArcDragRef: { current: { draggedHandlePosition: { x: 1, y: 2 } } as TEllipseArcDragState },
          ellipseArcRatioDragRef: { current: { draggedHandlePosition: { x: 5, y: 6 } } as TEllipseArcRatioDragState },
          ellipseArcRotateDragRef: { current: { draggedHandlePosition: { x: 3, y: 4 } } as TEllipseArcRotateDragState },
        },
      }),
    );

    // result
    const positions = drawEllipseArcHandleMock.mock.calls.map((call) => call[10]);

    expect(positions).toContainEqual({ x: 1, y: 2 });
    expect(positions).toContainEqual({ x: 3, y: 4 });
    expect(positions).toContainEqual({ x: 5, y: 6 });
  });
});
