// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize } from 'types/design/types';
import { TGridTrackValueEditTarget } from 'utils/canvas/gridSlots/getGridTrackValueEditTarget';

// utils
import { commitHugTrackEdit } from '../commitHugTrackEdit';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
});

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#fff',
    gridColumnCount: 1,
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
  }) as TFrameNode;

const edit: TGridTrackValueEditTarget = {
  axis: 'column',
  badgeHeight: 24,
  badgeWidth: 40,
  center: { x: 0, y: 0 },
  frameId: 'grid-1',
  index: 0,
  pillCenter: { x: 0, y: 0 },
  value: '',
};

describe('commitHugTrackEdit', () => {
  it('should switch the track to fixed at the parsed number', () => {
    // mock
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.hug }];

    // action
    commitHugTrackEdit(dispatch, frame(), edit, currentTracks, [0], '120');

    // result
    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 120 }] }, id: 'grid-1' });
  });

  it('should not dispatch when the input is unparsable', () => {
    // mock
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.hug }];

    // action
    commitHugTrackEdit(dispatch, frame(), edit, currentTracks, [0], 'abc');

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
