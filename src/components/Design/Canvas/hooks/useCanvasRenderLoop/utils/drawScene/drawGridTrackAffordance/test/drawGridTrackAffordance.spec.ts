// store
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TFrameNode } from 'types/design/types';

// utils
import { drawGridTrackAffordance } from '../drawGridTrackAffordance';

const drawGridTrackAffordanceAxisMock = vi.fn();

vi.mock('../drawGridTrackAffordanceAxis', () => ({
  drawGridTrackAffordanceAxis: (...args: unknown[]): void => drawGridTrackAffordanceAxisMock(...args),
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
    drawGridTrackAffordanceAxisMock.mockClear();
  });

  it('should draw both the column and row axes for the hovered cell, collapsed, when no pill is hovered', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 1,
      frameId: 'frame-1',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 0,
    };

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame });

    expect(drawGridTrackAffordanceAxisMock).toHaveBeenCalledTimes(2);

    const [, , columnAxis, columnIsExpanded] = drawGridTrackAffordanceAxisMock.mock.calls[0];
    const [, , rowAxis, rowIsExpanded] = drawGridTrackAffordanceAxisMock.mock.calls[1];

    expect(columnAxis).toBe('column');
    expect(columnIsExpanded).toBe(false);
    expect(rowAxis).toBe('row');
    expect(rowIsExpanded).toBe(false);
  });

  it('should mark only the hovered axis as expanded, and pass along its track and resolved size', () => {
    const frame = gridFrame({ gridColumnSizes: [{ mode: SizingMode.fill, value: 2 }] });
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: 'value',
      hoveredPillAxis: 'column',
      rowIndex: 0,
    };

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame });

    const [, , , columnIsExpanded, columnHandlePart, columnTrack] = drawGridTrackAffordanceAxisMock.mock.calls[0];
    const [, , , rowIsExpanded, rowHandlePart] = drawGridTrackAffordanceAxisMock.mock.calls[1];

    expect(columnIsExpanded).toBe(true);
    expect(columnHandlePart).toBe('value');
    expect(columnTrack).toEqual({ mode: SizingMode.fill, value: 2 });
    expect(rowIsExpanded).toBe(false);
    expect(rowHandlePart).toBeNull();
  });

  it('should pass the hovered handle part to the row axis when the row pill is the expanded one', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: 'grip',
      hoveredPillAxis: 'row',
      rowIndex: 0,
    };

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame });

    const [, , , columnIsExpanded, columnHandlePart] = drawGridTrackAffordanceAxisMock.mock.calls[0];
    const [, , , rowIsExpanded, rowHandlePart] = drawGridTrackAffordanceAxisMock.mock.calls[1];

    expect(columnIsExpanded).toBe(false);
    expect(columnHandlePart).toBeNull();
    expect(rowIsExpanded).toBe(true);
    expect(rowHandlePart).toBe('grip');
  });

  it('should still draw when the hovered index is stale and past the resolved tracks', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 99,
      frameId: 'frame-1',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 99,
    };

    expect(() => drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame })).not.toThrow();
    expect(drawGridTrackAffordanceAxisMock).toHaveBeenCalledTimes(2);
  });

  it('should draw nothing when there is no hover state', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame });

    expect(drawGridTrackAffordanceAxisMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hover state belongs to a different frame', () => {
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = {
      columnIndex: 0,
      frameId: 'other-frame',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 0,
    };

    drawGridTrackAffordance(context, [frame], refs, { 'frame-1': frame });

    expect(drawGridTrackAffordanceAxisMock).not.toHaveBeenCalled();
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

    drawGridTrackAffordance(context, [], refs, {});

    expect(drawGridTrackAffordanceAxisMock).not.toHaveBeenCalled();
  });
});
