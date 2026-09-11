// constant
import { GRID_SLOT_ACTIVE_FILL, GRID_SLOT_ACTIVE_STROKE } from 'constant/canvas';

// types
import { LayoutVersion, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TFrameNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';
import { TGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';

// utils
import { drawGridTrackAffordanceGhost } from '../drawGridTrackAffordanceGhost';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
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
  height: 200,
  id: 'frame-1',
  layoutVersion: LayoutVersion.updated,
  name: 'Frame',
  parentId: null,
  rotation: 30,
  type: NodeType.frame,
  width: 300,
  x: 10,
  y: 20,
};

const layout: TGridTrackLayout = {
  columnCount: 3,
  columnGap: 10,
  columnSizes: [80, 100, 120],
  padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
  rowCount: 2,
  rowGap: 5,
  rowSizes: [60, 90],
};

const frameCenter = { x: 160, y: 120 };

const dragState = (overrides: Partial<TGridTrackAffordanceDragState> = {}): TGridTrackAffordanceDragState => ({
  axis: 'column',
  dropIndex: 1,
  frameId: 'frame-1',
  ghostPosition: { x: 90, y: 20 },
  hasMoved: true,
  sourceIndices: [0],
  ...overrides,
});

describe('drawGridTrackAffordanceGhost', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should do nothing when there is no active drag', () => {
    drawGridTrackAffordanceGhost(context, frame, layout, null, frameCenter);

    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should do nothing before the pointer has actually moved', () => {
    drawGridTrackAffordanceGhost(context, frame, layout, dragState({ hasMoved: false }), frameCenter);

    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw a full-height column-wide ghost slot sized to the dragged track, centered on the tracked pointer x', () => {
    drawGridTrackAffordanceGhost(context, frame, layout, dragState(), frameCenter);

    expect(drawRectMock).toHaveBeenCalledTimes(1);

    const [, , , rect, , , , rotation, rotationCenter] = drawRectMock.mock.calls[0];

    expect(rect).toMatchObject({
      fill: GRID_SLOT_ACTIVE_FILL,
      height: 200,
      stroke: GRID_SLOT_ACTIVE_STROKE,
      width: 80,
      x: 90 - 40,
      y: 20,
    });
    expect(rotation).toBe(30);
    expect(rotationCenter).toEqual(frameCenter);
  });

  it('should span multiple dragged tracks, gap included, for a multi-selection block', () => {
    drawGridTrackAffordanceGhost(context, frame, layout, dragState({ sourceIndices: [0, 1] }), frameCenter);

    const [, , , rect] = drawRectMock.mock.calls[0];

    // 80 + gap 10 + 100 = 190
    expect(rect).toMatchObject({ width: 190 });
  });

  it('should treat an out-of-range dragged index as zero-width instead of throwing', () => {
    drawGridTrackAffordanceGhost(context, frame, layout, dragState({ sourceIndices: [9] }), frameCenter);

    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect).toMatchObject({ width: 0 });
  });

  it('should draw a full-width row-wide ghost slot centered on the tracked pointer y for a row drag', () => {
    drawGridTrackAffordanceGhost(
      context,
      frame,
      layout,
      dragState({ axis: 'row', ghostPosition: { x: 10, y: 50 }, sourceIndices: [0] }),
      frameCenter,
    );

    const [, , , rect] = drawRectMock.mock.calls[0];

    expect(rect).toMatchObject({ height: 60, width: 300, x: 10, y: 50 - 30 });
  });
});
