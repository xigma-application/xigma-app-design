// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TFrameNode } from 'types/design/types';
import { TGridTrackAffordanceHover, TGridTrackSelection } from 'types/design/canvas/types';

// utils
import { drawGridTrackAffordanceAxisDraws } from '../drawGridTrackAffordanceAxisDraws';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';

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

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 3,
  gridColumnSizes: [{ mode: SizingMode.fill, value: 2 }],
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
};

const layout = getGridTrackLayout(frame, { 'frame-1': frame });
const frameCenter = { x: 150, y: 100 };

describe('drawGridTrackAffordanceAxisDraws', () => {
  beforeEach(() => {
    drawGridTrackAffordanceAxisMock.mockClear();
  });

  it('should draw the collapsed hovered cell on an axis with no expanded pill and no selection', () => {
    const hover: TGridTrackAffordanceHover = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 0,
    };

    drawGridTrackAffordanceAxisDraws(context, frame, layout, 'column', hover, null, 40, frameCenter);

    expect(drawGridTrackAffordanceAxisMock).toHaveBeenCalledTimes(1);

    const [, , axis, isExpanded, handlePart, track, resolvedSize, rotation, rotationCenter] = drawGridTrackAffordanceAxisMock.mock.calls[0];

    expect(axis).toBe('column');
    expect(isExpanded).toBe(false);
    expect(handlePart).toBeNull();
    expect(track).toEqual({ mode: SizingMode.fill, value: 2 });
    expect(resolvedSize).toBe(layout.columnSizes[0]);
    expect(rotation).toBe(0);
    expect(rotationCenter).toEqual(frameCenter);
  });

  it('should draw nothing when there is no hover and no selection for this axis', () => {
    drawGridTrackAffordanceAxisDraws(context, frame, layout, 'column', null, null, 40, frameCenter);

    expect(drawGridTrackAffordanceAxisMock).not.toHaveBeenCalled();
  });

  it('should draw a single expanded pinned pill when only a selection exists on this axis, with no hover', () => {
    const selection: TGridTrackSelection = { axis: 'column', frameId: 'frame-1', indices: [0] };

    drawGridTrackAffordanceAxisDraws(context, frame, layout, 'column', null, selection, 40, frameCenter);

    expect(drawGridTrackAffordanceAxisMock).toHaveBeenCalledTimes(1);

    const [, , , isExpanded, handlePart] = drawGridTrackAffordanceAxisMock.mock.calls[0];

    expect(isExpanded).toBe(true);
    expect(handlePart).toBeNull();
  });

  it('should draw two separate pills when the hovered cell and the pinned selection land on different indices', () => {
    const hover: TGridTrackAffordanceHover = {
      columnIndex: 0,
      frameId: 'frame-1',
      hoveredHandlePart: null,
      hoveredPillAxis: null,
      rowIndex: 0,
    };
    const selection: TGridTrackSelection = { axis: 'row', frameId: 'frame-1', indices: [1] };

    drawGridTrackAffordanceAxisDraws(context, frame, layout, 'row', hover, selection, 40, frameCenter);

    expect(drawGridTrackAffordanceAxisMock).toHaveBeenCalledTimes(2);
  });

  it('should draw one expanded pill per selected index in a multi-selection', () => {
    const selection: TGridTrackSelection = { axis: 'column', frameId: 'frame-1', indices: [0, 1, 2] };

    drawGridTrackAffordanceAxisDraws(context, frame, layout, 'column', null, selection, 40, frameCenter);

    expect(drawGridTrackAffordanceAxisMock).toHaveBeenCalledTimes(3);
    drawGridTrackAffordanceAxisMock.mock.calls.forEach(([, , , isExpanded]) => expect(isExpanded).toBe(true));
  });
});
