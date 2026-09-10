// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize } from 'types/design/types';

// utils
import { commitGridAxisValueChange } from '../commitGridAxisValueChange';

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

describe('commitGridAxisValueChange', () => {
  it('should clamp a negative value to zero', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fixed, value: 40 }];

    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, 0, -5);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 0 }] }, id: 'grid-1' });
  });

  it('should forward a positive value as-is', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fixed, value: 40 }];

    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, 0, 80);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 80 }] }, id: 'grid-1' });
  });

  it('should leave every other track untouched', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
    ];

    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, 0, 80);

    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridColumnSizes: [
          { mode: SizingMode.fixed, value: 80 },
          { mode: SizingMode.fixed, value: 60 },
        ],
      },
      id: 'grid-1',
    });
  });
});
