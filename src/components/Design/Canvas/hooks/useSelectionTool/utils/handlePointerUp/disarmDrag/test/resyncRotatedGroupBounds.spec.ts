// store
import { addNode, groupNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDragState } from 'types/design/selectionTool/types';
import { TGroupNode } from 'types/design/types';

// utils
import { resyncRotatedGroupBounds } from '../resyncRotatedGroupBounds';

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: size, name: 'Frame', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const dragState = (nodeIds: string[]): TDragState => ({
  candidateShapes: [],
  dispatchThrottle: { frameId: null, run: null },
  hasMoved: true,
  nodeOrigins: Object.fromEntries(nodeIds.map((id) => [id, { x: 0, y: 0 }])),
  pendingClickAction: null,
  pointerStart: { x: 0, y: 0 },
});

describe('resyncRotatedGroupBounds', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should resync a rotated group’s bounds once a child was dragged independently of the group', () => {
    // mock — [idA, idB] grouped and rotated; idA then dragged +100 in x on its own, breaking the
    // rigid body, exactly like a Ctrl/⌘+click bypass drag
    const idA = addFrameNode(0, 0, 20);
    const idB = addFrameNode(100, 0, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    const groupId = selectActivePage(store.getState()).nodes[idA].parentId as string;

    store.dispatch(updateNode({ changes: { rotation: 30 }, id: groupId }));
    const staleGroup = selectActivePage(store.getState()).nodes[groupId] as TGroupNode;

    store.dispatch(updateNode({ changes: { x: 200 }, id: idA }));

    // action — only idA was part of this drag, not the group itself
    resyncRotatedGroupBounds(store.dispatch, dragState([idA]));

    // result — the group's box changed to account for idA's new position
    const resynced = selectActivePage(store.getState()).nodes[groupId];
    expect(resynced).not.toMatchObject({ height: staleGroup.height, width: staleGroup.width, x: staleGroup.x, y: staleGroup.y });
  });

  it('should leave the group untouched when the group itself was part of the same drag (a whole-group rigid move)', () => {
    // mock — the exact case that must NOT trigger a recompute: dragging the rotated group as one
    // rigid unit already moves it and its children by the same delta via their own updateNode calls
    const idA = addFrameNode(300, 0, 20);
    const idB = addFrameNode(400, 0, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    const groupId = selectActivePage(store.getState()).nodes[idA].parentId as string;

    store.dispatch(updateNode({ changes: { rotation: 30 }, id: groupId }));
    const rigidGroup = selectActivePage(store.getState()).nodes[groupId] as TGroupNode;

    // action — groupId, idA and idB are all part of the same drag, so nothing counts as "broken"
    resyncRotatedGroupBounds(store.dispatch, dragState([groupId, idA, idB]));

    // result
    expect(selectActivePage(store.getState()).nodes[groupId]).toMatchObject({
      height: rigidGroup.height,
      width: rigidGroup.width,
      x: rigidGroup.x,
      y: rigidGroup.y,
    });
  });

  it('should leave the group untouched when its rotation is 0 — the plain sync path already keeps it in sync', () => {
    // mock
    const idA = addFrameNode(500, 0, 20);
    const idB = addFrameNode(600, 0, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    const groupId = selectActivePage(store.getState()).nodes[idA].parentId as string;
    const plainGroup = selectActivePage(store.getState()).nodes[groupId] as TGroupNode;

    store.dispatch(updateNode({ changes: { x: 700 }, id: idA }));

    // action
    resyncRotatedGroupBounds(store.dispatch, dragState([idA]));

    // result — untouched by this util; already handled elsewhere for unrotated groups
    expect(selectActivePage(store.getState()).nodes[groupId]).toMatchObject({
      height: plainGroup.height,
      width: plainGroup.width,
    });
  });

  it('should do nothing when no dragged node belongs to a group', () => {
    // mock
    const idA = addFrameNode(800, 0, 20);

    // action & result
    expect(() => resyncRotatedGroupBounds(store.dispatch, dragState([idA]))).not.toThrow();
  });

  it('should do nothing when the broken group’s childIds no longer resolve to any node', () => {
    // mock — idA dragged on its own, its parent group rotated, but the group's childIds are now
    // dangling (e.g. the sibling was deleted elsewhere in the same gesture)
    const idA = addFrameNode(900, 0, 20);
    const idB = addFrameNode(1000, 0, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    const groupId = selectActivePage(store.getState()).nodes[idA].parentId as string;

    store.dispatch(updateNode({ changes: { rotation: 30 }, id: groupId }));
    store.dispatch(updateNode({ changes: { childIds: ['gone-a', 'gone-b'] }, id: groupId }));

    // action & result
    expect(() => resyncRotatedGroupBounds(store.dispatch, dragState([idA]))).not.toThrow();
  });
});
