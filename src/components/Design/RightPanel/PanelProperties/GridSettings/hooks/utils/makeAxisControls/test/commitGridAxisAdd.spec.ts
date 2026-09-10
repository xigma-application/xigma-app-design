// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize } from 'types/design/types';

// utils
import { commitGridAxisAdd } from '../commitGridAxisAdd';

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

describe('commitGridAxisAdd', () => {
  it('should append a fill track and bump the count', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fixed, value: 10 }];

    commitGridAxisAdd(dispatch, frame(), 'column', currentTracks);

    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridColumnCount: 2,
        gridColumnSizes: [
          { mode: SizingMode.fixed, value: 10 },
          { mode: SizingMode.fill, value: 1 },
        ],
      },
      id: 'grid-1',
    });
  });
});
