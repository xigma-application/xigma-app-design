// types
import { TCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawHoveredCornerRadiusValueLabel } from '../drawHoveredCornerRadiusValueLabel';

const drawCornerRadiusValueLabelMock = vi.fn();

vi.mock('../drawCornerRadiusValueLabel', () => ({
  drawCornerRadiusValueLabel: (...args: unknown[]): void => drawCornerRadiusValueLabelMock(...args),
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

describe('drawHoveredCornerRadiusValueLabel', () => {
  beforeEach(() => {
    drawCornerRadiusValueLabelMock.mockClear();
  });

  it('should draw nothing when not actively dragging, not hovering a corner, even with a resolved corner on the drag ref', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: { cornerRadiusDragRef: { current: { corner: 'nw', hasMoved: false } as TCornerRadiusDragState } },
    });

    // before
    drawHoveredCornerRadiusValueLabel(context, refs, false, BOUNDS, 15, 0, 'rect-1');

    // result
    expect(drawCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing while dragging but before a corner is resolved', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: { cornerRadiusDragRef: { current: { corner: null, hasMoved: true } as TCornerRadiusDragState } },
    });

    // before
    drawHoveredCornerRadiusValueLabel(context, refs, true, BOUNDS, 15, 0, 'rect-1');

    // result
    expect(drawCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the value label for the resolved corner while actively dragging', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: { cornerRadiusDragRef: { current: { corner: 'se', hasMoved: true } as TCornerRadiusDragState } },
    });

    // before
    drawHoveredCornerRadiusValueLabel(context, refs, true, BOUNDS, 15, 30, 'rect-1');

    // result
    expect(drawCornerRadiusValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawCornerRadiusValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, 15, 30, 'se', true);
  });

  it('should draw nothing when a DIFFERENT node is marked as hovering a corner handle', () => {
    // mock
    const refs = createCanvasRefs({
      hover: { hoveredCornerRadiusHandleRef: { current: { corner: 'nw', nodeId: 'some-other-node' } } },
    });

    // before
    drawHoveredCornerRadiusValueLabel(context, refs, false, BOUNDS, 15, 0, 'rect-1');

    // result
    expect(drawCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the value label for the precisely hovered corner, without dragging', () => {
    // mock
    const refs = createCanvasRefs({
      hover: { hoveredCornerRadiusHandleRef: { current: { corner: 'nw', nodeId: 'rect-1' } } },
    });

    // before
    drawHoveredCornerRadiusValueLabel(context, refs, false, BOUNDS, 15, 0, 'rect-1');

    // result
    expect(drawCornerRadiusValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawCornerRadiusValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, 15, 0, 'nw', false);
  });

  it('should prefer the actively-dragged corner over a stale hover ref for a different corner', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: { cornerRadiusDragRef: { current: { corner: 'se', hasMoved: true } as TCornerRadiusDragState } },
      hover: { hoveredCornerRadiusHandleRef: { current: { corner: 'nw', nodeId: 'rect-1' } } },
    });

    // before
    drawHoveredCornerRadiusValueLabel(context, refs, true, BOUNDS, 15, 30, 'rect-1');

    // result
    expect(drawCornerRadiusValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, 15, 30, 'se', true);
  });
});
