// store
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';

// utils
import { commitGridAxisReorder } from '../commitGridAxisReorder';

vi.mock('store/design/slice', async () => {
  const actual = await vi.importActual<typeof import('store/design/slice')>('store/design/slice');

  return { ...actual, updateNode: vi.fn(actual.updateNode) };
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

describe('commitGridAxisReorder', () => {
  it('should move a whole spanning block and report both of its new positions', () => {
    const dispatch = vi.fn();
    const nodes = byId([rect('a', { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0 })]);
    const gridFrame = frame({ childIds: ['a'], gridColumnCount: 3 });
    const columnTracks = tracks(
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
    );

    const newIndices = commitGridAxisReorder(dispatch, gridFrame, nodes, 'column', columnTracks, [0, 1], 3);

    expect(newIndices).toEqual([1, 2]);
    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnAnchorIndex: 1 }, id: 'a' });
  });

  it('should move a track and carry a manually anchored child along', () => {
    const dispatch = vi.fn();
    const nodes = byId([rect('a', { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0 })]);
    const gridFrame = frame({ childIds: ['a'], gridColumnCount: 3 });
    const columnTracks = tracks(
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
    );

    const newIndices = commitGridAxisReorder(dispatch, gridFrame, nodes, 'column', columnTracks, [2], 0);

    expect(newIndices).toEqual([0]);
    expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnAnchorIndex: 0 }, id: 'a' });
  });

  it('should reject a non-contiguous selection', () => {
    const dispatch = vi.fn();
    const columnTracks = tracks(
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
    );

    const newIndices = commitGridAxisReorder(dispatch, frame({ gridColumnCount: 3 }), {}, 'column', columnTracks, [0, 2], 1);

    expect(newIndices).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should reject an identity move', () => {
    const dispatch = vi.fn();
    const columnTracks = tracks(
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
    );

    const newIndices = commitGridAxisReorder(dispatch, frame({ gridColumnCount: 3 }), {}, 'column', columnTracks, [1], 1);

    expect(newIndices).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should reject a move that would split a spanning child', () => {
    const dispatch = vi.fn();
    const nodes = byId([rect('a', { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0 })]);
    const gridFrame = frame({ childIds: ['a'], gridColumnCount: 4 });
    const columnTracks = tracks(
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
      { mode: SizingMode.fixed, value: 10 },
    );

    const newIndices = commitGridAxisReorder(dispatch, gridFrame, nodes, 'column', columnTracks, [0], 3);

    expect(newIndices).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
