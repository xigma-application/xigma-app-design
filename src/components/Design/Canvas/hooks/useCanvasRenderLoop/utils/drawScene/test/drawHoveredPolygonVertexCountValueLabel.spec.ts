// types
import { TPolygonVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawHoveredPolygonVertexCountValueLabel } from '../drawHoveredPolygonVertexCountValueLabel';
import { getPolygonVertexCountHandlePosition } from 'utils/canvas/vertexCount/polygon/getPolygonVertexCountHandlePosition';

const drawVertexCountValueLabelMock = vi.fn();

vi.mock('../drawVertexCountValueLabel', () => ({
  drawVertexCountValueLabel: (...args: unknown[]): void => drawVertexCountValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};
const restHandlePosition = getPolygonVertexCountHandlePosition(BOUNDS, 3, 0, false, false);

describe('drawHoveredPolygonVertexCountValueLabel', () => {
  beforeEach(() => {
    drawVertexCountValueLabelMock.mockClear();
  });

  it('should draw nothing when the handle is neither hovered nor being dragged', () => {
    // before
    drawHoveredPolygonVertexCountValueLabel(context, createCanvasRefs(), BOUNDS, 3, 0, 0, false, false, 'polygon-1');

    // result
    expect(drawVertexCountValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a DIFFERENT node is marked as hovering the handle', () => {
    // before
    drawHoveredPolygonVertexCountValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredPolygonVertexCountHandleRef: { current: 'some-other-node' } } }),
      BOUNDS,
      3,
      0,
      0,
      false,
      false,
      'polygon-1',
    );

    // result
    expect(drawVertexCountValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the label at the rest handle position when precisely hovering the handle', () => {
    // before
    drawHoveredPolygonVertexCountValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredPolygonVertexCountHandleRef: { current: 'polygon-1' } } }),
      BOUNDS,
      3,
      0,
      0,
      false,
      false,
      'polygon-1',
    );

    // result
    expect(drawVertexCountValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawVertexCountValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, restHandlePosition, 0, 3);
  });

  it('should draw the label while actively dragging the handle, even without a matching hover ref', () => {
    // before
    drawHoveredPolygonVertexCountValueLabel(
      context,
      createCanvasRefs({
        vertexCount: { polygonVertexCountDragRef: { current: { nodeId: 'polygon-1' } as TPolygonVertexCountDragState } },
      }),
      BOUNDS,
      3,
      0,
      0,
      false,
      false,
      'polygon-1',
    );

    // result
    expect(drawVertexCountValueLabelMock).toHaveBeenCalledTimes(1);
  });
});
