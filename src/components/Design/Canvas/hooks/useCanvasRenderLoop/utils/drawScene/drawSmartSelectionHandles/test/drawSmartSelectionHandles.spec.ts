// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawSmartSelectionHandles } from '../drawSmartSelectionHandles';
import { getSmartSelectionSuggestion } from '../../../../../../utils/getSmartSelectionSuggestion';

const drawSmartSelectionGapFillPreviewMock = vi.fn();
const drawSmartSelectionGapHandlesMock = vi.fn();
const drawSmartSelectionGapHoverLabelMock = vi.fn();
const drawSmartSelectionSuggestionIconMock = vi.fn();
const drawSmartSelectionSwapHandlesMock = vi.fn();
const drawSmartSelectionSwapShadowMock = vi.fn();

vi.mock('../drawSmartSelectionGapFillPreview/drawSmartSelectionGapFillPreview', () => ({
  drawSmartSelectionGapFillPreview: (...args: unknown[]): void => drawSmartSelectionGapFillPreviewMock(...args),
}));
vi.mock('../drawSmartSelectionGapHandles', () => ({
  drawSmartSelectionGapHandles: (...args: unknown[]): void => drawSmartSelectionGapHandlesMock(...args),
}));
vi.mock('../drawSmartSelectionGapHoverLabel', () => ({
  drawSmartSelectionGapHoverLabel: (...args: unknown[]): void => drawSmartSelectionGapHoverLabelMock(...args),
}));
vi.mock('../drawSmartSelectionSuggestionIcon', () => ({
  drawSmartSelectionSuggestionIcon: (...args: unknown[]): void => drawSmartSelectionSuggestionIconMock(...args),
}));
vi.mock('../drawSmartSelectionSwapHandles', () => ({
  drawSmartSelectionSwapHandles: (...args: unknown[]): void => drawSmartSelectionSwapHandlesMock(...args),
}));
vi.mock('../drawSmartSelectionSwapShadow', () => ({
  drawSmartSelectionSwapShadow: (...args: unknown[]): void => drawSmartSelectionSwapShadowMock(...args),
}));
vi.mock('../../../../../../utils/getSmartSelectionSuggestion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../../../utils/getSmartSelectionSuggestion')>();

  return { getSmartSelectionSuggestion: vi.fn(actual.getSmartSelectionSuggestion) };
});

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const rect = (id: string, x: number, y = 0): TSceneNode =>
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
    y,
  }) as TSceneNode;

describe('drawSmartSelectionHandles', () => {
  beforeEach(() => {
    drawSmartSelectionGapFillPreviewMock.mockClear();
    drawSmartSelectionGapHandlesMock.mockClear();
    drawSmartSelectionGapHoverLabelMock.mockClear();
    drawSmartSelectionSuggestionIconMock.mockClear();
    drawSmartSelectionSwapHandlesMock.mockClear();
    drawSmartSelectionSwapShadowMock.mockClear();
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
    expect(drawSmartSelectionSuggestionIconMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionGapHoverLabelMock).toHaveBeenCalledTimes(1);
  });

  it('should draw the suggestion icon once the pointer is inside the box for a near-miss row', () => {
    const refs = createCanvasRefs({ hover: { isSmartSelectionBoxHoveredRef: { current: true } } });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 90), rect('c', 230)],
      refs,
    );

    expect(drawSmartSelectionSuggestionIconMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionIconMock.mock.calls[0][4]).toBe('row');
    expect(drawSmartSelectionGapHandlesMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSwapHandlesMock).not.toHaveBeenCalled();
  });

  it('should draw the column-kind suggestion icon for a near-miss vertical stack', () => {
    const refs = createCanvasRefs({ hover: { isSmartSelectionBoxHoveredRef: { current: true } } });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0, 0), rect('b', 0, 90), rect('c', 0, 230)],
      refs,
    );

    expect(drawSmartSelectionSuggestionIconMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionIconMock.mock.calls[0][4]).toBe('column');
  });

  it('should draw the grid-kind suggestion icon for a grid-append suggestion', () => {
    vi.mocked(getSmartSelectionSuggestion).mockReturnValueOnce({ axis: 'x', type: 'grid-append' } as never);
    const refs = createCanvasRefs({ hover: { isSmartSelectionBoxHoveredRef: { current: true } } });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 90), rect('c', 230)],
      refs,
    );

    expect(drawSmartSelectionSuggestionIconMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionIconMock.mock.calls[0][4]).toBe('grid');
  });

  it('should draw no suggestion icon when the pointer is inside the box but there is no suggestion', () => {
    const refs = createCanvasRefs({ hover: { isSmartSelectionBoxHoveredRef: { current: true } } });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0)],
      refs,
    );

    expect(drawSmartSelectionSuggestionIconMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionGapHoverLabelMock).toHaveBeenCalledTimes(1);
  });

  it('should draw the grid-kind suggestion icon for a near-miss grid', () => {
    const refs = createCanvasRefs({ hover: { isSmartSelectionBoxHoveredRef: { current: true } } });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0, 0), rect('b', 100, 0), rect('c', 250, 0), rect('d', 0, 100), rect('e', 100, 100), rect('f', 250, 100)],
      refs,
    );

    expect(drawSmartSelectionSuggestionIconMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionIconMock.mock.calls[0][4]).toBe('grid');
  });

  it('should not draw the suggestion icon while the pointer is outside the box', () => {
    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 90), rect('c', 230)],
      createCanvasRefs(),
    );

    expect(drawSmartSelectionSuggestionIconMock).not.toHaveBeenCalled();
  });

  it('should not draw the suggestion icon when a valid layout already exists', () => {
    const refs = createCanvasRefs({ hover: { isSmartSelectionBoxHoveredRef: { current: true } } });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 100)],
      refs,
    );

    expect(drawSmartSelectionSuggestionIconMock).not.toHaveBeenCalled();
  });

  it('should draw only the swap handles, in their bordered form, while the pointer is outside the selection box', () => {
    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 100)],
      createCanvasRefs(),
    );

    expect(drawSmartSelectionGapHandlesMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionGapFillPreviewMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSwapHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSwapHandlesMock.mock.calls[0][4]).toBe(false);
  });

  it('should draw the gap handles and the dot-form swap handles once the pointer is inside the selection box, without the fill preview while not dragging', () => {
    const refs = createCanvasRefs({ hover: { isSmartSelectionBoxHoveredRef: { current: true } } });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 100)],
      refs,
    );

    expect(drawSmartSelectionGapHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSwapHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSwapHandlesMock.mock.calls[0][4]).toBe(true);
    expect(drawSmartSelectionGapFillPreviewMock).not.toHaveBeenCalled();
  });

  it('should draw the fill preview for every gap on the dragged axis while a gap drag is in progress, even if the box-hover ref was never set', () => {
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
    expect(drawSmartSelectionGapHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSwapHandlesMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSwapHandlesMock.mock.calls[0][4]).toBe(true);
  });

  it('should draw the swap shadow outline while a swap drag that has moved is in progress, even without a valid live layout', () => {
    const swapDragState = {
      dispatchThrottle: { frameId: null, run: null },
      fromIndex: 0,
      hasMoved: true,
      nodeOrigins: {},
      pointerStart: { x: 0, y: 0 },
      slots: [
        { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: 'a' },
        { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: 'b' },
      ],
      targetIndex: 1,
    };
    const refs = createCanvasRefs({ smartSelection: { swapDragRef: { current: swapDragState } } });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0)],
      refs,
    );

    expect(drawSmartSelectionSwapShadowMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSwapShadowMock.mock.calls[0][3]).toBe(swapDragState);
  });

  it('should suppress the gap and swap handles while a swap drag is in progress, even with a still-valid layout', () => {
    const refs = createCanvasRefs({
      hover: { isSmartSelectionBoxHoveredRef: { current: true } },
      smartSelection: {
        swapDragRef: {
          current: {
            dispatchThrottle: { frameId: null, run: null },
            fromIndex: 0,
            hasMoved: true,
            nodeOrigins: {},
            pointerStart: { x: 0, y: 0 },
            slots: [
              { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: 'a' },
              { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: 'b' },
            ],
            targetIndex: 1,
          },
        },
      },
    });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 100)],
      refs,
    );

    expect(drawSmartSelectionSwapShadowMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionGapHandlesMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionGapFillPreviewMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSwapHandlesMock).not.toHaveBeenCalled();
  });

  it('should draw nothing at all while a plain move drag is in progress, even with an otherwise-valid layout and a hovered box', () => {
    const refs = createCanvasRefs({
      hover: { isSmartSelectionBoxHoveredRef: { current: true } },
      transform: { draggedNodeIdsRef: { current: new Set(['a', 'b']) } },
    });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 100)],
      refs,
    );

    expect(drawSmartSelectionGapHandlesMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionGapFillPreviewMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSwapHandlesMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSwapShadowMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionGapHoverLabelMock).not.toHaveBeenCalled();
  });

  it('should not draw the swap shadow before the swap drag has moved', () => {
    const refs = createCanvasRefs({
      smartSelection: {
        swapDragRef: {
          current: {
            dispatchThrottle: { frameId: null, run: null },
            fromIndex: 0,
            hasMoved: false,
            nodeOrigins: {},
            pointerStart: { x: 0, y: 0 },
            slots: [{ bounds: { height: 50, width: 50, x: 0, y: 0 }, id: 'a' }],
            targetIndex: 0,
          },
        },
      },
    });

    drawSmartSelectionHandles(
      { buffer, canvasHeight: 200, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT } as never,
      [rect('a', 0), rect('b', 100)],
      refs,
    );

    expect(drawSmartSelectionSwapShadowMock).not.toHaveBeenCalled();
  });
});
