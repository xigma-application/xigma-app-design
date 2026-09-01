// types
import { TCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawDraggedCornerRadiusValueLabel } from '../drawDraggedCornerRadiusValueLabel';

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

describe('drawDraggedCornerRadiusValueLabel', () => {
  beforeEach(() => {
    drawCornerRadiusValueLabelMock.mockClear();
  });

  it('should draw nothing when not actively dragging, even with a resolved corner on the ref', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: { cornerRadiusDragRef: { current: { corner: 'nw', hasMoved: false } as TCornerRadiusDragState } },
    });

    // before
    drawDraggedCornerRadiusValueLabel(context, refs, false, BOUNDS, 15, 0);

    // result
    expect(drawCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw nothing while dragging but before a corner is resolved', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: { cornerRadiusDragRef: { current: { corner: null, hasMoved: true } as TCornerRadiusDragState } },
    });

    // before
    drawDraggedCornerRadiusValueLabel(context, refs, true, BOUNDS, 15, 0);

    // result
    expect(drawCornerRadiusValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the value label for the resolved corner while actively dragging', () => {
    // mock
    const refs = createCanvasRefs({
      cornerRadius: { cornerRadiusDragRef: { current: { corner: 'se', hasMoved: true } as TCornerRadiusDragState } },
    });

    // before
    drawDraggedCornerRadiusValueLabel(context, refs, true, BOUNDS, 15, 30);

    // result
    expect(drawCornerRadiusValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawCornerRadiusValueLabelMock).toHaveBeenCalledWith(context, BOUNDS, 15, 30, 'se');
  });
});
