// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getGridAxisTrackList } from '../getGridAxisTrackList';

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 3,
  height: 200,
  id: 'grid-1',
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

describe('getGridAxisTrackList', () => {
  it('should build the column track list from the frame’s provided sizes', () => {
    const columnTracks = getGridAxisTrackList(frame({ gridColumnSizes: [{ mode: SizingMode.fixed, value: 40 }] }), {}, 'column');

    expect(columnTracks).toEqual([{ mode: SizingMode.fixed, value: 40 }, DEFAULT_TRACK, DEFAULT_TRACK]);
  });

  it('should build the row track list from the frame’s provided sizes', () => {
    const rowTracks = getGridAxisTrackList(frame({ gridRowCount: 2, gridRowSizes: [{ mode: SizingMode.fixed, value: 20 }] }), {}, 'row');

    expect(rowTracks).toEqual([{ mode: SizingMode.fixed, value: 20 }, DEFAULT_TRACK]);
  });
});

const DEFAULT_TRACK = { mode: SizingMode.fill, value: 1 };
