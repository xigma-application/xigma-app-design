// types
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawHoveredPolygonCornerRadiusValueLabel } from '../drawHoveredPolygonCornerRadiusValueLabel';

const drawPolygonCornerRadiusValueLabelMock = vi.fn();

vi.mock('../drawPolygonCornerRadiusValueLabel', () => ({
  drawPolygonCornerRadiusValueLabel: (...args: unknown[]): void => drawPolygonCornerRadiusValueLabelMock(...args),
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

describe('drawHoveredPolygonCornerRadiusValueLabel', () => {
  beforeEach(() => {
    drawPolygonCornerRadiusValueLabelMock.mockClear();
  });

  it('should draw nothing when neither dragging nor hovering the handle', () => {
    // mock
    const refs = createCanvasRefs();

    // before
    drawHoveredPolygonCornerRadiusValueLabel(context, refs, false, BOUNDS, 5, 15, 0, false, false, 'polygon-1');

    // result
    expect(drawPolygonCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it("should draw nothing while some OTHER shape's corner-radius handle is being dragged (no polygon drag ref of its own)", () => {
    // mock
    const refs = createCanvasRefs();

    // before — isDraggingCornerRadius true (e.g. a rectangle is being dragged), but this polygon has no drag ref set
    drawHoveredPolygonCornerRadiusValueLabel(context, refs, true, BOUNDS, 5, 15, 0, false, false, 'polygon-1');

    // result
    expect(drawPolygonCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when a DIFFERENT node is marked as hovering the handle', () => {
    // mock
    const refs = createCanvasRefs({ hover: { hoveredPolygonCornerRadiusHandleRef: { current: 'some-other-node' } } });

    // before
    drawHoveredPolygonCornerRadiusValueLabel(context, refs, false, BOUNDS, 5, 15, 0, false, false, 'polygon-1');

    // result
    expect(drawPolygonCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it("should draw the value label while actively dragging the polygon's own handle", () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: { polygonCornerRadiusDragRef: { current: { hasMoved: true } as TPolygonCornerRadiusDragState } },
    });

    // before
    drawHoveredPolygonCornerRadiusValueLabel(context, refs, true, BOUNDS, 5, 15, 30, true, false, 'polygon-1');

    // result
    expect(drawPolygonCornerRadiusValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawPolygonCornerRadiusValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, 5, 15, 30, true, false, true);
  });

  it('should draw the value label when precisely hovering the handle, without dragging', () => {
    // mock
    const refs = createCanvasRefs({ hover: { hoveredPolygonCornerRadiusHandleRef: { current: 'polygon-1' } } });

    // before
    drawHoveredPolygonCornerRadiusValueLabel(context, refs, false, BOUNDS, 5, 15, 0, false, false, 'polygon-1');

    // result
    expect(drawPolygonCornerRadiusValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawPolygonCornerRadiusValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, 5, 15, 0, false, false, false);
  });
});
