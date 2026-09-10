// store
import { setGridSettingsPanelOpen, updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';

// utils
import { commitGridAxisDelete } from '../commitGridAxisDelete';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, setGridSettingsPanelOpen: vi.fn(actual.setGridSettingsPanelOpen), updateNode: vi.fn(actual.updateNode) };
});

const frame = (overrides: Partial<TFrameNode> = {}): TFrameNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#fff',
    gridAutoPlacement: false,
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
  }) as TFrameNode;

const rect = (id: string, overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#000',
    height: 10,
    id,
    name: id,
    parentId: 'grid-1',
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const byId = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

const tracks = (...sizes: TGridTrackSize[]): TGridTrackSize[] => sizes;

describe('commitGridAxisDelete', () => {
  it('should delete the track and clamp the span of a child that covered it', () => {
    const dispatch = vi.fn();
    const nodes = byId([rect('a', { gridColumnAnchorIndex: 0, gridColumnSpan: 3, gridRowAnchorIndex: 0 })]);
    const gridFrame = frame({ childIds: ['a'], gridColumnCount: 3 });
    const columnTracks = tracks(
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
    );

    commitGridAxisDelete(dispatch, gridFrame, nodes, 'column', columnTracks, [2]);

    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnAnchorIndex: 0, gridColumnSpan: 2 }, id: 'a' });
  });

  it('should exit grid mode when deleting the last remaining track', () => {
    const dispatch = vi.fn();
    const gridFrame = frame({ childIds: ['a'], gridColumnCount: 1 });
    const nodes = byId([rect('a', { widthSizingMode: SizingMode.fill })]);

    commitGridAxisDelete(dispatch, gridFrame, nodes, 'column', tracks({ mode: SizingMode.fixed, value: 10 }), [0]);

    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridAutoPlacement: undefined,
        gridColumnCount: undefined,
        gridColumnSizes: undefined,
        gridRowCount: undefined,
        gridRowSizes: undefined,
        layoutMode: LayoutMode.freeForm,
        layoutWrap: false,
      },
      id: 'grid-1',
    });
    expect(updateNode).toHaveBeenCalledWith({
      changes: {
        gridChildHorizontalAlign: undefined,
        gridChildVerticalAlign: undefined,
        gridColumnAnchorIndex: undefined,
        gridColumnSpan: undefined,
        gridRowAnchorIndex: undefined,
        gridRowSpan: undefined,
      },
      id: 'a',
    });
    expect(updateNode).toHaveBeenCalledWith({ changes: { widthSizingMode: SizingMode.fixed }, id: 'a' });
    expect(setGridSettingsPanelOpen).toHaveBeenCalledWith(false);
  });

  it('should exit grid mode when deleting every remaining track at once', () => {
    const dispatch = vi.fn();
    const gridFrame = frame({ gridColumnCount: 2 });
    const columnTracks = tracks({ mode: SizingMode.fixed, value: 10 }, { mode: SizingMode.fixed, value: 10 });

    commitGridAxisDelete(dispatch, gridFrame, {}, 'column', columnTracks, [0, 1]);

    expect(updateNode).toHaveBeenCalledWith(
      expect.objectContaining({ changes: expect.objectContaining({ layoutMode: LayoutMode.freeForm }) }),
    );
  });

  it('should do nothing when no valid index is given to delete', () => {
    const dispatch = vi.fn();
    const gridFrame = frame({ gridColumnCount: 2 });
    const columnTracks = tracks({ mode: SizingMode.fixed, value: 10 }, { mode: SizingMode.fixed, value: 10 });

    commitGridAxisDelete(dispatch, gridFrame, {}, 'column', columnTracks, []);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
