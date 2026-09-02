// types
import { TStarCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawHoveredStarCornerRadiusValueLabel } from '../drawHoveredStarCornerRadiusValueLabel';

const drawStarCornerRadiusValueLabelMock = vi.fn();

vi.mock('../drawStarCornerRadiusValueLabel', () => ({
  drawStarCornerRadiusValueLabel: (...args: unknown[]): void => drawStarCornerRadiusValueLabelMock(...args),
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

describe('drawHoveredStarCornerRadiusValueLabel', () => {
  beforeEach(() => {
    drawStarCornerRadiusValueLabelMock.mockClear();
  });

  it('should draw nothing when neither dragging nor hovering the handle', () => {
    // before
    drawHoveredStarCornerRadiusValueLabel(context, createCanvasRefs(), false, BOUNDS, 5, 0.4, 15, 0, false, false, 'star-1');

    // result
    expect(drawStarCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it("should draw nothing while some OTHER shape's corner-radius handle is being dragged", () => {
    // before — isDraggingCornerRadius true, but this star has no drag ref set
    drawHoveredStarCornerRadiusValueLabel(context, createCanvasRefs(), true, BOUNDS, 5, 0.4, 15, 0, false, false, 'star-1');

    // result
    expect(drawStarCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a DIFFERENT node is marked as hovering the handle', () => {
    // before
    drawHoveredStarCornerRadiusValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredStarCornerRadiusHandleRef: { current: 'some-other-node' } } }),
      false,
      BOUNDS,
      5,
      0.4,
      15,
      0,
      false,
      false,
      'star-1',
    );

    // result
    expect(drawStarCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it("should draw the value label while actively dragging the star's own handle", () => {
    // before
    drawHoveredStarCornerRadiusValueLabel(
      context,
      createCanvasRefs({
        cornerRadius: { starCornerRadiusDragRef: { current: { hasMoved: true } as TStarCornerRadiusDragState } },
      }),
      true,
      BOUNDS,
      5,
      0.4,
      15,
      30,
      true,
      false,
      'star-1',
    );

    // result
    expect(drawStarCornerRadiusValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawStarCornerRadiusValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, 5, 0.4, 15, 30, true, false, true);
  });

  it('should draw the value label when precisely hovering the handle, without dragging', () => {
    // before
    drawHoveredStarCornerRadiusValueLabel(
      context,
      createCanvasRefs({ hover: { hoveredStarCornerRadiusHandleRef: { current: 'star-1' } } }),
      false,
      BOUNDS,
      5,
      0.4,
      15,
      0,
      false,
      false,
      'star-1',
    );

    // result
    expect(drawStarCornerRadiusValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawStarCornerRadiusValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, 5, 0.4, 15, 0, false, false, false);
  });
});
