// types
import { TStarRatioDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawHoveredStarRatioValueLabel } from '../drawHoveredStarRatioValueLabel';
import { getStarRatioHandlePosition } from 'utils/canvas/ratio/star/getStarRatioHandlePosition';

const drawStarRatioValueLabelMock = vi.fn();

vi.mock('../drawStarRatioValueLabel', () => ({
  drawStarRatioValueLabel: (...args: unknown[]): void => drawStarRatioValueLabelMock(...args),
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
const restHandlePosition = getStarRatioHandlePosition(BOUNDS, 5, 0.382, 0, false, false);

describe('drawHoveredStarRatioValueLabel', () => {
  beforeEach(() => {
    drawStarRatioValueLabelMock.mockClear();
  });

  it('should draw nothing when the handle is neither hovered nor being dragged', () => {
    // before
    drawHoveredStarRatioValueLabel(context, createCanvasRefs(), BOUNDS, 5, 0.382, 0, 0, false, false, 'star-1');

    // result
    expect(drawStarRatioValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a DIFFERENT node is marked as hovering the handle', () => {
    // before
    drawHoveredStarRatioValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredStarRatioHandleRef: { current: 'some-other-node' } } }),
      BOUNDS,
      5,
      0.382,
      0,
      0,
      false,
      false,
      'star-1',
    );

    // result
    expect(drawStarRatioValueLabelMock).not.toHaveBeenCalled();
  });

  it("should draw the label at the rest handle position with the star's ratio when precisely hovering", () => {
    // before
    drawHoveredStarRatioValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredStarRatioHandleRef: { current: 'star-1' } } }),
      BOUNDS,
      5,
      0.382,
      0,
      0,
      false,
      false,
      'star-1',
    );

    // result
    expect(drawStarRatioValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawStarRatioValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, restHandlePosition, 0, 0.382);
  });

  it('should draw the label while actively dragging the handle, even without a matching hover ref', () => {
    // before
    drawHoveredStarRatioValueLabel(
      context,
      createCanvasRefs({ starRatio: { starRatioDragRef: { current: { nodeId: 'star-1' } as TStarRatioDragState } } }),
      BOUNDS,
      5,
      0.382,
      0,
      0,
      false,
      false,
      'star-1',
    );

    // result
    expect(drawStarRatioValueLabelMock).toHaveBeenCalledTimes(1);
  });
});
