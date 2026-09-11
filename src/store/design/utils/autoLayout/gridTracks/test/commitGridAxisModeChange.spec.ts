// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize } from 'types/design/types';

// utils
import { commitGridAxisModeChange } from '../commitGridAxisModeChange';

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

describe('commitGridAxisModeChange', () => {
  it('should seed a fill weight of 1 when switching to fill', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fixed, value: 40 }];

    commitGridAxisModeChange(dispatch, frame(), 'column', currentTracks, [0], SizingMode.fill);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fill, value: 1 }] }, id: 'grid-1' });
  });

  it('should leave every other track untouched', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [
      { mode: SizingMode.fixed, value: 40 },
      { mode: SizingMode.fixed, value: 60 },
    ];

    commitGridAxisModeChange(dispatch, frame(), 'column', currentTracks, [0], SizingMode.hug);

    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridColumnSizes: [
          { mode: SizingMode.hug, value: 40 },
          { mode: SizingMode.fixed, value: 60 },
        ],
      },
      id: 'grid-1',
    });
  });

  it('should preserve an existing value when switching between non-fill modes', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fixed, value: 40 }];

    commitGridAxisModeChange(dispatch, frame(), 'column', currentTracks, [0], SizingMode.hug);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.hug, value: 40 }] }, id: 'grid-1' });
  });

  it('should default to 0 when switching a track with no value to a non-fill mode', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [{ mode: SizingMode.fill }];

    commitGridAxisModeChange(dispatch, frame(), 'column', currentTracks, [0], SizingMode.fixed);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 0 }] }, id: 'grid-1' });
  });

  it('should apply the same mode and value to every index given, for a multi-selection', () => {
    const dispatch = vi.fn();
    const currentTracks: TGridTrackSize[] = [
      { mode: SizingMode.fill, value: 1 },
      { mode: SizingMode.hug },
      { mode: SizingMode.fixed, value: 90 },
    ];

    commitGridAxisModeChange(dispatch, frame(), 'column', currentTracks, [0, 2], SizingMode.fixed, 240);

    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridColumnSizes: [{ mode: SizingMode.fixed, value: 240 }, { mode: SizingMode.hug }, { mode: SizingMode.fixed, value: 240 }],
      },
      id: 'grid-1',
    });
  });
});
