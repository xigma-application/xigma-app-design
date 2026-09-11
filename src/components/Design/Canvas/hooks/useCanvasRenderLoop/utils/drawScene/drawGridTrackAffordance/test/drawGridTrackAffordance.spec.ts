// store
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs, TGridTrackAffordanceDragState, TGridTrackSelection } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TFrameNode } from 'types/design/types';

// utils
import { drawGridTrackAffordance } from '../drawGridTrackAffordance';

const drawGridTrackAffordanceAxisDrawsMock = vi.fn();
const drawGridTrackAffordanceDropIndicatorMock = vi.fn();
const drawGridTrackAffordanceGhostMock = vi.fn();

vi.mock('../drawGridTrackAffordanceAxisDraws', () => ({
  drawGridTrackAffordanceAxisDraws: (...args: unknown[]): void => drawGridTrackAffordanceAxisDrawsMock(...args),
}));
vi.mock('../drawGridTrackAffordanceDropIndicator', () => ({
  drawGridTrackAffordanceDropIndicator: (...args: unknown[]): void => drawGridTrackAffordanceDropIndicatorMock(...args),
}));
vi.mock('../drawGridTrackAffordanceGhost', () => ({
  drawGridTrackAffordanceGhost: (...args: unknown[]): void => drawGridTrackAffordanceGhostMock(...args),
}));

const context: TDrawSceneContext = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
};

const gridFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 3,
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawGridTrackAffordance', () => {
  beforeEach(() => {
    drawGridTrackAffordanceAxisDrawsMock.mockClear();
    drawGridTrackAffordanceDropIndicatorMock.mockClear();
    drawGridTrackAffordanceGhostMock.mockClear();
  });

  it('should draw both axes when the hovered cell belongs to the selected frame', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 1,
      frameId: 'frame-1',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 0,
    };

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame }, null);

    expect(drawGridTrackAffordanceAxisDrawsMock).toHaveBeenCalledTimes(2);
    expect(drawGridTrackAffordanceDropIndicatorMock).toHaveBeenCalledTimes(1);
    expect(drawGridTrackAffordanceDropIndicatorMock).toHaveBeenCalledWith(
      context,
      frame,
      expect.anything(),
      refs.transform.gridTrackAffordanceDragRef.current,
      expect.anything(),
    );

    const [, , , columnAxis, columnHover] = drawGridTrackAffordanceAxisDrawsMock.mock.calls[0];
    const [, , , rowAxis, rowHover] = drawGridTrackAffordanceAxisDrawsMock.mock.calls[1];

    expect(columnAxis).toBe('column');
    expect(columnHover).toEqual(refs.hover.hoveredGridTrackAffordanceRef.current);
    expect(rowAxis).toBe('row');
    expect(rowHover).toEqual(refs.hover.hoveredGridTrackAffordanceRef.current);
  });

  it('should draw both axes, with a null hover, when there is no hover but a pinned selection exists for this frame', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();
    const selection: TGridTrackSelection = { axis: 'column', frameId: 'frame-1', indices: [0] };

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame }, selection);

    expect(drawGridTrackAffordanceAxisDrawsMock).toHaveBeenCalledTimes(2);

    const [, , , , hoverArg, selectionArg] = drawGridTrackAffordanceAxisDrawsMock.mock.calls[0];

    expect(hoverArg).toBeNull();
    expect(selectionArg).toEqual(selection);
  });

  it('should draw nothing when there is neither a hover nor a pinned selection', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame }, null);

    expect(drawGridTrackAffordanceAxisDrawsMock).not.toHaveBeenCalled();
    expect(drawGridTrackAffordanceDropIndicatorMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hover state belongs to a different frame, and drop a selection for a different frame too', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'other-frame',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 0,
    };

    const selection: TGridTrackSelection = { axis: 'column', frameId: 'other-frame', indices: [0] };

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame }, selection);

    expect(drawGridTrackAffordanceAxisDrawsMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when no grid frame is selected', () => {
    const refs: TCanvasRefs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 0,
    };

    drawGridTrackAffordance(context, [], refs, {}, null);

    expect(drawGridTrackAffordanceAxisDrawsMock).not.toHaveBeenCalled();
  });

  it('should draw the ghost and indicator even without a hover or selection, once a drag for this frame is active', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();
    const dragState: TGridTrackAffordanceDragState = {
      axis: 'column',
      dropIndex: 1,
      frameId: 'frame-1',
      ghostPosition: { x: 0, y: 0 },
      hasMoved: true,
      sourceIndices: [0],
    };

    refs.transform.gridTrackAffordanceDragRef.current = dragState;

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame }, null);

    expect(drawGridTrackAffordanceAxisDrawsMock).toHaveBeenCalledTimes(2);
    expect(drawGridTrackAffordanceDropIndicatorMock).toHaveBeenCalledWith(context, frame, expect.anything(), dragState, expect.anything());
    expect(drawGridTrackAffordanceGhostMock).toHaveBeenCalledWith(context, frame, expect.anything(), dragState, expect.anything());
  });

  it('should ignore a drag that belongs to a different frame', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.transform.gridTrackAffordanceDragRef.current = {
      axis: 'column',
      dropIndex: 1,
      frameId: 'other-frame',
      ghostPosition: { x: 0, y: 0 },
      hasMoved: true,
      sourceIndices: [0],
    };

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame }, null);

    expect(drawGridTrackAffordanceAxisDrawsMock).not.toHaveBeenCalled();
    expect(drawGridTrackAffordanceGhostMock).not.toHaveBeenCalled();
  });
});
