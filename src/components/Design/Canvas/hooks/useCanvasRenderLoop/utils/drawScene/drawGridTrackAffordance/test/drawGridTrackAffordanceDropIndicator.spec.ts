// types
import { LayoutVersion, NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TFrameNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';
import { TGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';

// utils
import { drawGridTrackAffordanceDropIndicator } from '../drawGridTrackAffordanceDropIndicator';

const drawRotatedLineMock = vi.fn();

vi.mock('utils/canvas/drawRotatedLine', () => ({
  drawRotatedLine: (...args: unknown[]): void => drawRotatedLineMock(...args),
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
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 10,
  y: 20,
};

const layout: TGridTrackLayout = {
  columnCount: 3,
  columnGap: 0,
  columnSizes: [80, 100, 120],
  padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
  rowCount: 1,
  rowGap: 0,
  rowSizes: [200],
};

const dragState = (overrides: Partial<TGridTrackAffordanceDragState> = {}): TGridTrackAffordanceDragState => ({
  axis: 'column',
  dropIndex: 2,
  frameId: 'frame-1',
  ghostPosition: { x: 0, y: 0 },
  hasMoved: true,
  sourceIndices: [0],
  ...overrides,
});

describe('drawGridTrackAffordanceDropIndicator', () => {
  beforeEach(() => {
    drawRotatedLineMock.mockClear();
  });

  it('should do nothing when there is no active drag', () => {
    drawGridTrackAffordanceDropIndicator(context, frame, layout, null, { x: 0, y: 0 });

    expect(drawRotatedLineMock).not.toHaveBeenCalled();
  });

  it('should do nothing when the drag belongs to a different frame', () => {
    drawGridTrackAffordanceDropIndicator(context, frame, layout, dragState({ frameId: 'other-frame' }), { x: 0, y: 0 });

    expect(drawRotatedLineMock).not.toHaveBeenCalled();
  });

  it('should do nothing before the pointer has actually moved', () => {
    drawGridTrackAffordanceDropIndicator(context, frame, layout, dragState({ hasMoved: false }), { x: 0, y: 0 });

    expect(drawRotatedLineMock).not.toHaveBeenCalled();
  });

  it('should draw a vertical line at the column boundary for a column drag', () => {
    drawGridTrackAffordanceDropIndicator(context, frame, layout, dragState({ dropIndex: 2 }), { x: 0, y: 0 });

    expect(drawRotatedLineMock).toHaveBeenCalledTimes(1);

    const [, , , line] = drawRotatedLineMock.mock.calls[0];

    // boundary before track 2 = 80 + 100 = 180, offset from frame.x (10) -> x 190
    expect(line).toEqual({ x1: 190, x2: 190, y1: 20, y2: 220 });
  });

  it('should draw a horizontal line at the row boundary for a row drag', () => {
    const rowLayout: TGridTrackLayout = { ...layout, rowGap: 10, rowSizes: [50, 60] };

    drawGridTrackAffordanceDropIndicator(context, frame, rowLayout, dragState({ axis: 'row', dropIndex: 1 }), { x: 0, y: 0 });

    expect(drawRotatedLineMock).toHaveBeenCalledTimes(1);

    const [, , , line] = drawRotatedLineMock.mock.calls[0];

    // boundary before row 1 = 50 + gap 10 = 60, offset from frame.y (20) -> y 80
    expect(line).toEqual({ x1: 10, x2: 310, y1: 80, y2: 80 });
  });
});
