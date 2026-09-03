// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawSmartSelectionGapValueBadge } from '../drawSmartSelectionGapValueBadge';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

describe('drawSmartSelectionGapValueBadge', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing while no gap drag is in progress', () => {
    drawSmartSelectionGapValueBadge(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the rounded current gap value at the badge anchor, offset upward for a horizontal (x-axis) gap', () => {
    const refs = createCanvasRefs({
      smartSelection: {
        gapDragRef: {
          current: {
            anchorPosition: 0,
            anchorSize: 50,
            axis: 'x',
            badgeAnchor: { x: 75, y: 25 },
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

    drawSmartSelectionGapValueBadge(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      refs,
    );

    expect(drawValueLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      '80',
      { x: 75, y: 25 },
      { x: 0, y: -1 },
      200,
      200,
      IDENTITY_VIEWPORT,
    );
  });

  it('should offset sideways for a vertical (y-axis) gap', () => {
    const refs = createCanvasRefs({
      smartSelection: {
        gapDragRef: {
          current: {
            anchorPosition: 0,
            anchorSize: 50,
            axis: 'y',
            badgeAnchor: { x: 25, y: 75 },
            cascadeGroups: [],
            currentGapValue: 50,
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

    drawSmartSelectionGapValueBadge(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      refs,
    );

    expect(drawValueLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      '50',
      { x: 25, y: 75 },
      { x: 1, y: 0 },
      200,
      200,
      IDENTITY_VIEWPORT,
    );
  });
});
