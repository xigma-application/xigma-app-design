// types
import { ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorWidthPointsPreview } from '../drawVectorWidthPointsPreview';

const drawVectorWidthPointsForNodeMock = vi.fn();
const drawVectorWidthPointHoverMarkerMock = vi.fn();
const drawVectorWidthValueLabelMock = vi.fn();

vi.mock('../drawVectorWidthPointsForNode', () => ({
  drawVectorWidthPointsForNode: (...args: unknown[]): void => drawVectorWidthPointsForNodeMock(...args),
}));
vi.mock('../drawVectorWidthPointHoverMarker', () => ({
  drawVectorWidthPointHoverMarker: (...args: unknown[]): void => drawVectorWidthPointHoverMarkerMock(...args),
}));
vi.mock('../drawVectorWidthValueLabel', () => ({
  drawVectorWidthValueLabel: (...args: unknown[]): void => drawVectorWidthValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

describe('drawVectorWidthPointsPreview', () => {
  beforeEach(() => {
    drawVectorWidthPointsForNodeMock.mockClear();
    drawVectorWidthPointHoverMarkerMock.mockClear();
    drawVectorWidthValueLabelMock.mockClear();
  });

  it('should draw the points for every editing node, plus the hover marker and value label once, reading from refs, while Variable Width is active', () => {
    // mock
    const refs = createCanvasRefs();

    refs.hover.hoveredVectorWidthPointRef.current = { nodeId: 'node-2', segmentId: 's1', t: 0.5 };

    // before
    drawVectorWidthPointsPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      {},
      ['node-1', 'node-2'],
      refs,
      ToolName.variableWidth,
    );

    // result
    expect(drawVectorWidthPointsForNodeMock).toHaveBeenCalledTimes(2);
    expect(drawVectorWidthPointsForNodeMock).toHaveBeenCalledWith(gl, program, buffer, {}, 'node-1', refs, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorWidthPointsForNodeMock).toHaveBeenCalledWith(gl, program, buffer, {}, 'node-2', refs, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorWidthPointHoverMarkerMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      {},
      refs.hover.hoveredVectorWidthPointRef.current,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorWidthValueLabelMock).toHaveBeenCalledWith(gl, program, buffer, imageContext, {}, refs, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should draw nothing per-node when there are no editing nodes, but still check the hover marker and value label', () => {
    // before
    drawVectorWidthPointsPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      {},
      [],
      createCanvasRefs(),
      ToolName.variableWidth,
    );

    // result
    expect(drawVectorWidthPointsForNodeMock).not.toHaveBeenCalled();
    expect(drawVectorWidthPointHoverMarkerMock).toHaveBeenCalledTimes(1);
    expect(drawVectorWidthValueLabelMock).toHaveBeenCalledTimes(1);
  });

  it('should draw nothing at all once Variable Width is no longer the active tool, even with editing nodes and a live drag still around', () => {
    // mock — simulates having just switched away from the tool, before any refs get cleared
    const refs = createCanvasRefs();

    refs.hover.hoveredVectorWidthPointRef.current = { nodeId: 'node-1', segmentId: 's1', t: 0.5 };

    // before
    drawVectorWidthPointsPreview(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      {},
      ['node-1'],
      refs,
      ToolName.default,
    );

    // result
    expect(drawVectorWidthPointsForNodeMock).not.toHaveBeenCalled();
    expect(drawVectorWidthPointHoverMarkerMock).not.toHaveBeenCalled();
    expect(drawVectorWidthValueLabelMock).not.toHaveBeenCalled();
  });
});
