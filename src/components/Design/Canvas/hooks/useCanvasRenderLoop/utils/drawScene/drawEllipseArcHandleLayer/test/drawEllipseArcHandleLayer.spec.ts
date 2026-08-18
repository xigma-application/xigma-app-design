// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TRectangleNode } from 'types/design/types';

// utils
import { drawEllipseArcHandleLayer } from '../drawEllipseArcHandleLayer';

const drawEllipseArcGuideLineMock = vi.fn();
const drawEllipseArcRatioGuideArcMock = vi.fn();
const drawEllipseArcHandleMock = vi.fn();

vi.mock('utils/canvas/drawEllipseArcGuideLine', () => ({
  drawEllipseArcGuideLine: (...args: unknown[]): void => drawEllipseArcGuideLineMock(...args),
}));
vi.mock('utils/canvas/drawEllipseArcRatioGuideArc', () => ({
  drawEllipseArcRatioGuideArc: (...args: unknown[]): void => drawEllipseArcRatioGuideArcMock(...args),
}));
vi.mock('utils/canvas/drawEllipseArcHandle', () => ({
  drawEllipseArcHandle: (...args: unknown[]): void => drawEllipseArcHandleMock(...args),
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
  });

  it('should draw nothing when nothing is selected', () => {
    // before
    drawEllipseArcHandleLayer({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, null, [], 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a multi-node selection', () => {
    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      null,
      [ellipse(), ellipse({ id: 'ellipse-2' })],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected node is not an ellipse', () => {
    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      null,
      [rectangle],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should draw nothing once the shape renders too small on screen', () => {
    // before
    drawEllipseArcHandleLayer({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, null, [ellipse()], 100, 100, {
      x: 0,
      y: 0,
      zoom: 0.9,
    });

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
    expect(drawEllipseArcGuideLineMock).not.toHaveBeenCalled();
  });

  it('should draw only the fully-cut-away guide line when not hovered', () => {
    // mock — arcStartAngle defaults to 90; a full 360° lap cut (arcEndAngle 450) collapses majorSweep to 0
    const node = ellipse({ arcEndAngle: 450 });

    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      null,
      [node],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcGuideLineMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should not draw the fully-cut-away guide line for a normal partial cut', () => {
    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      null,
      [ellipse({ arcEndAngle: 0 })],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcGuideLineMock).not.toHaveBeenCalled();
  });

  it('should draw the ratio guide arc once arcRatio reaches its max on a genuinely cut shape', () => {
    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      null,
      [ellipse({ arcEndAngle: 0, arcRatio: 1 })],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcRatioGuideArcMock).toHaveBeenCalledTimes(1);
  });

  it('should not draw the ratio guide arc on a full circle even at max arcRatio', () => {
    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      null,
      [ellipse({ arcRatio: 1 })],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcRatioGuideArcMock).not.toHaveBeenCalled();
  });

  it('should not draw any handles when the shape is selected but not hovered', () => {
    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      null,
      [ellipse({ arcEndAngle: 0 })],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcHandleMock).not.toHaveBeenCalled();
  });

  it('should draw the Sweep and Ratio handles, but not the Start handle, on an uncut ellipse when hovered', () => {
    // mock
    const node = ellipse();

    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [node],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcHandleMock).toHaveBeenCalledTimes(2);
  });

  it('should draw all three handles once a cut exists and the shape is hovered', () => {
    // mock
    const node = ellipse({ arcEndAngle: 0 });

    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [node],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcHandleMock).toHaveBeenCalledTimes(3);
  });

  it('should draw only the Sweep handle on a fully cut-away shape, even when hovered', () => {
    // mock — both the Start (rotate) and Ratio handles hide in this state
    const node = ellipse({ arcEndAngle: 450 });

    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [node],
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseArcHandleMock).toHaveBeenCalledTimes(1);
  });

  it('should use the provided dragged positions instead of computing rest positions when given', () => {
    // mock
    const node = ellipse({ arcEndAngle: 0 });

    // before
    drawEllipseArcHandleLayer(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [node],
      100,
      100,
      IDENTITY_VIEWPORT,
      { x: 1, y: 2 },
      { x: 3, y: 4 },
      { x: 5, y: 6 },
    );

    // result
    const positions = drawEllipseArcHandleMock.mock.calls.map((call) => call[10]);

    expect(positions).toContainEqual({ x: 1, y: 2 });
    expect(positions).toContainEqual({ x: 3, y: 4 });
    expect(positions).toContainEqual({ x: 5, y: 6 });
  });
});
