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

    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, [0], 0, -5);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 0 }] }, id: 'grid-1' });
  });

  it('should forward a positive value as-is', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fixed, value: 40 }];

    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, [0], 0, 80);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 80 }] }, id: 'grid-1' });
  });

  it('should leave every other track untouched', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
    ];

    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, [0], 0, 80);

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

  it('should preserve the mode of the row that triggered the change', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fill, value: 2 }];

    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, [0], 0, 3);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fill, value: 3 }] }, id: 'grid-1' });
  });

  it('should fall back to fixed when the trigger index is out of range', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fixed, value: 40 }];

    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, [0], 99, 80);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 80 }] }, id: 'grid-1' });
  });

  it("should apply the triggering row's own mode and the given value to every other index in a multi-selection", () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fill, value: 2 },
      { mode: SizingMode.hug },
    ];

    // triggered from index 0 (fixed) -> every selected index becomes fixed at the committed value
    commitGridAxisValueChange(dispatch, frame(), 'column', currentTracks, [0, 1, 2], 0, 200);

    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridColumnSizes: [
          { mode: SizingMode.fixed, value: 200 },
          { mode: SizingMode.fixed, value: 200 },
          { mode: SizingMode.fixed, value: 200 },
        ],
      },
      id: 'grid-1',
    });
  });
});
