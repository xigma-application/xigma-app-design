// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawSmartSelectionHandles } from '../drawSmartSelectionHandles';

const drawSmartSelectionGapFillPreviewMock = vi.fn();
const drawSmartSelectionGapHandlesMock = vi.fn();
const drawSmartSelectionGapHoverLabelMock = vi.fn();
const drawSmartSelectionSwapHandlesMock = vi.fn();

vi.mock('../drawSmartSelectionGapFillPreview', () => ({
  drawSmartSelectionGapFillPreview: (...args: unknown[]): void => drawSmartSelectionGapFillPreviewMock(...args),
}));
vi.mock('../drawSmartSelectionGapHandles', () => ({
  drawSmartSelectionGapHandles: (...args: unknown[]): void => drawSmartSelectionGapHandlesMock(...args),
}));
vi.mock('../drawSmartSelectionGapHoverLabel', () => ({
  drawSmartSelectionGapHoverLabel: (...args: unknown[]): void => drawSmartSelectionGapHoverLabelMock(...args),
}));
vi.mock('../drawSmartSelectionSwapHandles', () => ({
  drawSmartSelectionSwapHandles: (...args: unknown[]): void => drawSmartSelectionSwapHandlesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const rect = (id: string, x: number): TSceneNode =>
  ({
    fill: '#000',
    height: 50,
    id,
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 50,
    x,
    y: 0,
  }) as TSceneNode;

describe('drawSmartSelectionHandles', () => {
  beforeEach(() => {
    drawSmartSelectionGapFillPreviewMock.mockClear();
    drawSmartSelectionGapHandlesMock.mockClear();
    drawSmartSelectionGapHoverLabelMock.mockClear();
    drawSmartSelectionSwapHandlesMock.mockClear();
  });

  it('should draw nothing when the selection does not form a valid layout', () => {
    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0)],
      createCanvasRefs(),
    );

    expect(drawSmartSelectionGapHandlesMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSwapHandlesMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionGapFillPreviewMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionGapHoverLabelMock).toHaveBeenCalledTimes(1);
  });

  it('should draw gap and swap handles for a valid row selection, without the fill preview while not dragging', () => {
    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 100)],
      createCanvasRefs(),
    );

    expect(drawSmartSelectionGapHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSwapHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionGapFillPreviewMock).not.toHaveBeenCalled();
  });

  it('should draw the fill preview for every gap on the dragged axis while a gap drag is in progress', () => {
    const refs = createCanvasRefs({
      smartSelection: {
        gapDragRef: {
          current: {
            anchorPosition: 0,
            anchorSize: 50,
            axis: 'x',
            badgeAnchor: { x: 0, y: 0 },
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

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 100)],
      refs,
    );

    expect(drawSmartSelectionGapFillPreviewMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionGapFillPreviewMock.mock.calls[0][4]).toBe('x');
  });
});
