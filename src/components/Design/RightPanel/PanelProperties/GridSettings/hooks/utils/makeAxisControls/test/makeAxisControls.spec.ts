// store
import { setGridSettingsPanelOpen, updateNode } from 'store/design/slice';

// types
import { LayoutMode, NodeType, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';

// utils
import { makeAxisControls } from '../makeAxisControls';

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

describe('makeAxisControls', () => {
  describe('tracks', () => {
    it('should default the view-model value to 1 for fill and 0 for non-fill without a value', () => {
      const columnSizes = tracks({ mode: SizingMode.fill }, { mode: SizingMode.fixed, value: 80 }, { mode: SizingMode.hug });
      const controls = makeAxisControls(vi.fn(), frame({ gridColumnSizes: columnSizes }), {}, 'column', columnSizes);

      // frame is 200 wide, 3 columns, no gaps/padding: fixed keeps 80, hug has no children (0), fill takes the rest
      expect(controls.tracks).toEqual([
        { index: 0, linkedIndices: [0], mode: SizingMode.fill, resolvedSize: 120, value: 1 },
        { index: 1, linkedIndices: [1], mode: SizingMode.fixed, resolvedSize: 80, value: 80 },
        { index: 2, linkedIndices: [2], mode: SizingMode.hug, resolvedSize: 0, value: 0 },
      ]);
    });

    it('should group the tracks a spanning child covers together', () => {
      const nodes = byId([rect('a', { gridColumnAnchorIndex: 0, gridColumnSpan: 2 })]);
      const columnTracks = tracks(
        { mode: SizingMode.fixed, value: 10 },
        { mode: SizingMode.fixed, value: 10 },
        { mode: SizingMode.fixed, value: 10 },
      );

      const controls = makeAxisControls(vi.fn(), frame({ childIds: ['a'] }), nodes, 'column', columnTracks);

      expect(controls.tracks.map((track) => track.linkedIndices)).toEqual([[0, 1], [0, 1], [2]]);
    });
  });

  describe('onAdd', () => {
    it('should append a fill track and bump the count', () => {
      const dispatch = vi.fn();

      makeAxisControls(dispatch, frame(), {}, 'column', tracks({ mode: SizingMode.fixed, value: 10 })).onAdd();

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

  describe('onChangeMode', () => {
    it('should seed a fill weight of 1 when switching to fill', () => {
      const dispatch = vi.fn();

      makeAxisControls(dispatch, frame(), {}, 'column', tracks({ mode: SizingMode.fixed, value: 40 })).onChangeMode([0], SizingMode.fill);

      expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fill, value: 1 }] }, id: 'grid-1' });
    });

    it('should preserve an existing value when switching between non-fill modes', () => {
      const dispatch = vi.fn();

      makeAxisControls(dispatch, frame(), {}, 'column', tracks({ mode: SizingMode.fixed, value: 40 })).onChangeMode([0], SizingMode.hug);

      expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.hug, value: 40 }] }, id: 'grid-1' });
    });

    it('should default to 0 when switching a track with no value to a non-fill mode', () => {
      const dispatch = vi.fn();

      makeAxisControls(dispatch, frame(), {}, 'column', tracks({ mode: SizingMode.fill })).onChangeMode([0], SizingMode.fixed);

      expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 0 }] }, id: 'grid-1' });
    });
  });

  describe('onChangeValue', () => {
    it('should clamp a negative value to zero', () => {
      const dispatch = vi.fn();

      makeAxisControls(dispatch, frame(), {}, 'column', tracks({ mode: SizingMode.fixed, value: 40 })).onChangeValue([0], 0, -5);

      expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnSizes: [{ mode: SizingMode.fixed, value: 0 }] }, id: 'grid-1' });
    });
  });

  describe('onDelete', () => {
    it('should delete the track and clamp the span of a child that covered it', () => {
      const dispatch = vi.fn();
      const nodes = byId([rect('a', { gridColumnAnchorIndex: 0, gridColumnSpan: 3, gridRowAnchorIndex: 0 })]);
      const gridFrame = frame({ childIds: ['a'], gridColumnCount: 3 });

      makeAxisControls(
        dispatch,
        gridFrame,
        nodes,
        'column',
        tracks({ mode: SizingMode.fixed, value: 10 }, { mode: SizingMode.fixed, value: 10 }, { mode: SizingMode.fixed, value: 10 }),
      ).onDelete([2]);

      expect(updateNode).toHaveBeenCalledWith({ changes: { gridColumnAnchorIndex: 0, gridColumnSpan: 2 }, id: 'a' });
    });

    it('should exit grid mode when deleting the last remaining track', () => {
      const dispatch = vi.fn();
      const gridFrame = frame({ childIds: ['a'], gridColumnCount: 1 });
      const nodes = byId([rect('a', { widthSizingMode: SizingMode.fill })]);

      makeAxisControls(dispatch, gridFrame, nodes, 'column', tracks({ mode: SizingMode.fixed, value: 10 })).onDelete([0]);

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

      makeAxisControls(dispatch, gridFrame, {}, 'column', columnTracks).onDelete([0, 1]);

      expect(updateNode).toHaveBeenCalledWith(
        expect.objectContaining({ changes: expect.objectContaining({ layoutMode: LayoutMode.freeForm }) }),
      );
    });
  });

  describe('onReorder', () => {
    it('should move a whole spanning block and report both of its new positions', () => {
      const dispatch = vi.fn();
      const nodes = byId([rect('a', { gridColumnAnchorIndex: 0, gridColumnSpan: 2, gridRowAnchorIndex: 0 })]);
      const gridFrame = frame({ childIds: ['a'], gridColumnCount: 3 });
      const columnTracks = tracks(
        { mode: SizingMode.fixed, value: 10 },
        { mode: SizingMode.fixed, value: 10 },
        { mode: SizingMode.fixed, value: 10 },
      );

      const newIndices = makeAxisControls(dispatch, gridFrame, nodes, 'column', columnTracks).onReorder([0, 1], 3);

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

      const newIndices = makeAxisControls(dispatch, gridFrame, nodes, 'column', columnTracks).onReorder([2], 0);

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

      const newIndices = makeAxisControls(dispatch, frame({ gridColumnCount: 3 }), {}, 'column', columnTracks).onReorder([0, 2], 1);

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

      const newIndices = makeAxisControls(dispatch, frame({ gridColumnCount: 3 }), {}, 'column', columnTracks).onReorder([1], 1);

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

      const newIndices = makeAxisControls(dispatch, gridFrame, nodes, 'column', columnTracks).onReorder([0], 3);

      expect(newIndices).toBeNull();
      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
