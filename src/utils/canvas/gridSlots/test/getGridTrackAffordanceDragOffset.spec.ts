// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TGridTrackAffordanceDragState } from 'types/design/canvas/types';
import { TGridTrackLayout } from '../getGridTrackLayout';

// utils
import { getGridTrackAffordanceDragOffset } from '../getGridTrackAffordanceDragOffset';

const buildFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
  gridColumnCount: 2,
  gridRowCount: 2,
  height: 100,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const LAYOUT: TGridTrackLayout = {
  columnCount: 2,
  columnGap: 10,
  columnSizes: [50, 50],
  padding: { paddingBottom: 0, paddingLeft: 5, paddingRight: 0, paddingTop: 8 },
  rowCount: 2,
  rowGap: 20,
  rowSizes: [30, 40],
};

const dragStateFor = (overrides: Partial<TGridTrackAffordanceDragState> = {}): TGridTrackAffordanceDragState => ({
  axis: 'column',
  dropIndex: 0,
  frameId: 'frame-1',
  ghostPosition: { x: 100, y: 0 },
  hasMoved: true,
  sourceIndices: [0],
  ...overrides,
});

describe('getGridTrackAffordanceDragOffset', () => {
  it('should measure the offset from the original track center to the ghost, for a single column track', () => {
    // action
    const offset = getGridTrackAffordanceDragOffset(buildFrame(), LAYOUT, dragStateFor());

    // result — track 0 spans world x 5..55 (padding 5 + width 50), center 30; ghost at x=100
    expect(offset).toBe(70);
  });

  it('should span the center across every selected column track, not just the first', () => {
    // action
    const offset = getGridTrackAffordanceDragOffset(buildFrame(), LAYOUT, dragStateFor({ sourceIndices: [0, 1] }));

    // result — combined span 5..115 (padding 5 + col0 50 + gap 10 + col1 50), center 60; ghost at x=100
    expect(offset).toBe(40);
  });

  it('should read row sizes/gap/padding and the ghost’s y position when the axis is row', () => {
    // action
    const offset = getGridTrackAffordanceDragOffset(
      buildFrame(),
      LAYOUT,
      dragStateFor({ axis: 'row', ghostPosition: { x: 0, y: 100 }, sourceIndices: [0] }),
    );

    // result — row 0 spans world y 8..38 (padding 8 + height 30), center 23; ghost at y=100
    expect(offset).toBe(77);
  });

  it('should treat a selected index past the known track sizes as zero-width, instead of throwing', () => {
    // action
    const offset = getGridTrackAffordanceDragOffset(buildFrame(), LAYOUT, dragStateFor({ sourceIndices: [5] }));

    // result — track 5 has no known size, so its span is zero-width at its own gap-based offset
    expect(Number.isFinite(offset)).toBe(true);
  });

  it('should offset by the frame’s own world position, not treat it as being at the origin', () => {
    // action
    const offset = getGridTrackAffordanceDragOffset(buildFrame({ x: 200 }), LAYOUT, dragStateFor());

    // result — track 0 now spans world x 205..255, center 230; ghost at x=100
    expect(offset).toBe(-130);
  });
});
