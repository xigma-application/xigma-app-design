// types
import { TStarVertexCountDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawHoveredStarVertexCountValueLabel } from '../drawHoveredStarVertexCountValueLabel';
import { getStarVertexCountHandlePosition } from 'utils/canvas/vertexCount/star/getStarVertexCountHandlePosition';

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
const restHandlePosition = getStarVertexCountHandlePosition(BOUNDS, 5, 0.4, 0, false, false);

describe('drawHoveredStarVertexCountValueLabel', () => {
  beforeEach(() => {
    drawVertexCountValueLabelMock.mockClear();
  });

  it('should draw nothing when the handle is neither hovered nor being dragged', () => {
    // before
    drawHoveredStarVertexCountValueLabel(context, createCanvasRefs(), BOUNDS, 5, 0.4, 0, 0, false, false, 'star-1');

    // result
    expect(drawVertexCountValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a DIFFERENT node is marked as hovering the handle', () => {
    // before
    drawHoveredStarVertexCountValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredStarVertexCountHandleRef: { current: 'some-other-node' } } }),
      BOUNDS,
      5,
      0.4,
      0,
      0,
      false,
      false,
      'star-1',
    );

    // result
    expect(drawVertexCountValueLabelMock).not.toHaveBeenCalled();
  });

  it("should draw the label with the star's point count at the rest handle position when precisely hovering", () => {
    // before
    drawHoveredStarVertexCountValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredStarVertexCountHandleRef: { current: 'star-1' } } }),
      BOUNDS,
      5,
      0.4,
      0,
      0,
      false,
      false,
      'star-1',
    );

    // result
    expect(drawVertexCountValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawVertexCountValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, restHandlePosition, 0, 5);
  });

  it('should draw the label while actively dragging the handle, even without a matching hover ref', () => {
    // before
    drawHoveredStarVertexCountValueLabel(
      context,
      createCanvasRefs({
        vertexCount: { starVertexCountDragRef: { current: { nodeId: 'star-1' } as TStarVertexCountDragState } },
      }),
      BOUNDS,
      5,
      0.4,
      0,
      0,
      false,
      false,
      'star-1',
    );

    // result
    expect(drawVertexCountValueLabelMock).toHaveBeenCalledTimes(1);
  });
});
