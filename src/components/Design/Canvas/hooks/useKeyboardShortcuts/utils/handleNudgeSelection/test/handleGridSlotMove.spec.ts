// store
import { addNodes, deleteNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handleGridSlotMove } from '../handleGridSlotMove';

let seq = 0;

const node = (id: string): any => selectActivePage(store.getState()).nodes[id];

type TGridChildSpec = {
  columnSpan?: number;
  gridColumnAnchorIndex: number;
  gridRowAnchorIndex: number;
  id: string;
  rowSpan?: number;
};

const setupGrid = (columnCount: number | undefined, children: TGridChildSpec[]): { frameId: string } => {
  seq += 1;

  const frameId = `grid-frame-${seq}`;

  store.dispatch(
    addNodes({
      nodes: [
        {
          childIds: children.map((child) => child.id),
          clipContent: true,
          fill: '#fff',
          gridAutoPlacement: false,
          gridColumnCount: columnCount,
          height: 300,
          id: frameId,
          layoutMode: LayoutMode.grid,
          name: 'Frame',
          parentId: null,
          rotation: 0,
          type: NodeType.frame,
          width: 300,
          x: 0,
          y: 0,
        },
        ...children.map((child) => ({
          fill: '#000',
          gridColumnAnchorIndex: child.gridColumnAnchorIndex,
          gridColumnSpan: child.columnSpan ?? 1,
          gridRowAnchorIndex: child.gridRowAnchorIndex,
          gridRowSpan: child.rowSpan ?? 1,
          height: 50,
          id: child.id,
          name: 'Rectangle',
          parentId: frameId,
          rotation: 0,
          type: NodeType.rectangle,
          width: 50,
          x: 0,
          y: 0,
        })),
      ] as any,
      rootIds: [frameId],
    }),
  );

  return { frameId };
};

const move = (frameId: string, selectedIds: string[], deltaX: number, deltaY: number): void => {
  const nodesById = selectActivePage(store.getState()).nodes as unknown as Record<string, TSceneNode>;
  const frame = nodesById[frameId] as TFrameNode;
  const selectedNodes = selectedIds.map((id) => nodesById[id]);

  handleGridSlotMove(store.dispatch, createCanvasRefs(), frame, selectedNodes, nodesById, deltaX, deltaY);
};

describe('handleGridSlotMove', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should move a single selected item into the free adjacent slot', () => {
    // mock
    const { frameId } = setupGrid(3, [{ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' }]);

    // before
    move(frameId, ['a'], 1, 0);

    // result
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0 });
  });

  it('should be undoable as a single step', () => {
    // mock
    const { frameId } = setupGrid(3, [{ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' }]);

    // before
    move(frameId, ['a'], 1, 0);
    store.dispatch(undo());

    // result
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0 });
  });

  it('should block the move when the neighbor slot is occupied by a non-selected node', () => {
    // mock
    const { frameId } = setupGrid(3, [
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' },
      { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0, id: 'b' },
    ]);

    // before
    move(frameId, ['a'], 1, 0);

    // result — the whole gesture is a no-op, the occupant doesn't move either
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 0 });
    expect(node('b')).toMatchObject({ gridColumnAnchorIndex: 1 });
  });

  it('should block the move at the negative edge of the grid', () => {
    // mock
    const { frameId } = setupGrid(3, [{ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' }]);

    // before
    move(frameId, ['a'], -1, 0);

    // result
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 0 });
  });

  it('should block the move past the column track count', () => {
    // mock — last valid column is index 1 on a 2-column grid
    const { frameId } = setupGrid(2, [{ gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0, id: 'a' }]);

    // before
    move(frameId, ['a'], 1, 0);

    // result
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 1 });
  });

  it('should move the whole multi-selection atomically when every target slot is free', () => {
    // mock — two items stacked in separate rows, same column
    const { frameId } = setupGrid(3, [
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' },
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 1, id: 'b' },
    ]);

    // before
    move(frameId, ['a', 'b'], 1, 0);

    // result
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 1 });
    expect(node('b')).toMatchObject({ gridColumnAnchorIndex: 1 });
  });

  it('should block the whole multi-select move when an unselected item sits between the selected items in the press direction', () => {
    // mock — 'gap' is NOT part of the selection and sits directly between 'a' and 'b'
    const { frameId } = setupGrid(4, [
      { gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' },
      { gridColumnAnchorIndex: 1, gridRowAnchorIndex: 0, id: 'gap' },
      { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0, id: 'b' },
    ]);

    // before — move the whole selection right; 'a' would land on 'gap''s cell
    move(frameId, ['a', 'b'], 1, 0);

    // result — nothing moves, not even 'b', whose own target slot was free
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 0 });
    expect(node('b')).toMatchObject({ gridColumnAnchorIndex: 2 });
    expect(node('gap')).toMatchObject({ gridColumnAnchorIndex: 1 });
  });

  it("should account for a spanning item's full region when checking collisions", () => {
    // mock — 'a' spans columns [0,1]; moving right by 1 would shift it to [1,2], colliding with
    // 'occupant' at column 2 even though 'occupant' never touched 'a''s original cells
    const { frameId } = setupGrid(4, [
      { columnSpan: 2, gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' },
      { gridColumnAnchorIndex: 2, gridRowAnchorIndex: 0, id: 'occupant' },
    ]);

    // before
    move(frameId, ['a'], 1, 0);

    // result
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 0 });
  });

  it('should treat a frame with no explicit gridColumnCount as a single-column grid', () => {
    // mock
    const { frameId } = setupGrid(undefined, [{ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' }]);

    // before — the only valid column is index 0, so moving right is immediately out of bounds
    move(frameId, ['a'], 1, 0);

    // result
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 0 });
  });

  it('should do nothing when neither delta is set', () => {
    // mock
    const { frameId } = setupGrid(3, [{ gridColumnAnchorIndex: 0, gridRowAnchorIndex: 0, id: 'a' }]);

    // before & result — must not throw with no direction to move in
    expect(() => move(frameId, ['a'], 0, 0)).not.toThrow();
    expect(node('a')).toMatchObject({ gridColumnAnchorIndex: 0 });
  });
});
