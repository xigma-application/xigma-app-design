// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawSmartSelectionGapHoverLabel } from '../drawSmartSelectionGapHoverLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

describe('drawSmartSelectionGapHoverLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing while neither hovering nor dragging a gap handle', () => {
    drawSmartSelectionGapHoverLabel(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the rounded gap value at the live pointer position while hovering, offset toward the top-right', () => {
    const refs = createCanvasRefs({
      hover: { hoveredSmartSelectionGapRef: { current: { axis: 'x', gapValue: 49.6, point: { x: 75, y: 25 } } } },
    });

    drawSmartSelectionGapHoverLabel(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      refs,
    );

    expect(drawValueLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      '50',
      { x: 75, y: 25 },
      { x: 1, y: -1 },
      200,
      200,
      IDENTITY_VIEWPORT,
    );
  });

  it("should draw the live drag value at the drag state's badge anchor (the pointer's own live position), preferring it over a stale hover ref", () => {
    const refs = createCanvasRefs({
      hover: { hoveredSmartSelectionGapRef: { current: { axis: 'x', gapValue: 999, point: { x: 0, y: 0 } } } },
      smartSelection: {
        gapDragRef: {
          current: {
            anchorPosition: 0,
            anchorSize: 50,
            axis: 'x',
            badgeAnchor: { x: 130, y: 25 },
            cascadeGroups: [],
            currentGapValue: 79.6,
            dispatchThrottle: { frameId: null, run: null },
            gapIndex: 0,
            hasMoved: true,
            nodeOrigins: {},
            originalGapValue: 50,
            pointerStart: { x: 0, y: 0 },
          },
        },
      },
    });

    drawSmartSelectionGapHoverLabel(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      refs,
    );

    expect(drawValueLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      '80',
      { x: 130, y: 25 },
      { x: 1, y: -1 },
      200,
      200,
      IDENTITY_VIEWPORT,
    );
  });
});
