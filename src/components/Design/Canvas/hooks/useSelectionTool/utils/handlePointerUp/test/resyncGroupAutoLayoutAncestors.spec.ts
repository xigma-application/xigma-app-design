// store
import { addNode, deleteNode, moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

// utils
import { resyncGroupAutoLayoutAncestors } from '../resyncGroupAutoLayoutAncestors';

const addRect = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({ fill: '#000', height: size, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: size, x, y }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addGroup = (x: number, y: number): string => {
  store.dispatch(addNode({ childIds: [], height: 20, name: 'Group', parentId: null, rotation: 0, type: NodeType.group, width: 20, x, y }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrame = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#fff',
      height: size,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resyncGroupAutoLayoutAncestors', () => {
  beforeEach(() => {
    selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));
  });

  it('should do nothing for an empty id list', () => {
    // action / result
    expect(() => resyncGroupAutoLayoutAncestors(store.dispatch, [])).not.toThrow();
  });

  it('should do nothing when the dragged node has no parent', () => {
    // mock
    const idA = addRect(0, 0);

    // action / result
    expect(() => resyncGroupAutoLayoutAncestors(store.dispatch, [idA])).not.toThrow();
  });

  it('should do nothing when the dragged node’s parent is not group-like', () => {
    // mock — direct member of an auto-layout frame, not a Group/Mask
    const frameId = addAutoLayoutFrame(0, 0);
    const idA = addRect(0, 0);
    store.dispatch(moveNodes({ nodeIds: [idA], targetIndex: 0, targetParentId: frameId }));

    // action
    resyncGroupAutoLayoutAncestors(store.dispatch, [idA]);

    // result — the frame's own width is untouched (no reflow was needed/triggered)
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ width: 200 });
  });

  it('should skip a parent that is itself among the dragged ids (dragging a container with its own child)', () => {
    // mock — group-1 sits in an auto-layout frame; both the group and its own child are "dragged"
    const frameId = addAutoLayoutFrame(0, 0);
    const groupId = addGroup(0, 0);
    const idA = addRect(0, 0);
    store.dispatch(moveNodes({ nodeIds: [idA], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));

    // action
    resyncGroupAutoLayoutAncestors(store.dispatch, [groupId, idA]);

    // result — no crash, and the group's own parent (the frame) is left as-is since the group
    // itself, not some untouched ancestor, was part of the dragged set
    expect(selectActivePage(store.getState()).nodes[groupId]).toMatchObject({ width: 20 });
  });

  it('should reflow the auto-layout frame when one of a group’s two children moved, reshaping the group’s own box', () => {
    // mock — a and b live in group-1, itself a member of a horizontal auto-layout frame alongside 'c'.
    // Only b was dragged; a stayed anchored in place — a genuine internal rearrangement
    const frameId = addAutoLayoutFrame(0, 0);
    const groupId = addGroup(0, 0);
    const idA = addRect(0, 0);
    const idB = addRect(60, 0);
    const idC = addRect(0, 0);
    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [idC], targetIndex: 1, targetParentId: frameId }));

    // simulate b's own drag position having already spread the group wider (0..120)
    store.dispatch({ payload: { changes: { x: 100 }, id: idB }, type: 'design/updateNode' });

    // action — only b was part of this drag
    resyncGroupAutoLayoutAncestors(store.dispatch, [idB]);

    // result — the frame reacted once, sliding 'c' over to sit right after the now-wider group
    const page = selectActivePage(store.getState());
    expect(page.nodes[groupId]).toMatchObject({ width: 120 });
    expect(page.nodes[idC]).toMatchObject({ x: 120 });
  });

  it('should NOT reflow the auto-layout frame when every one of the group’s children was dragged — that is a rigid move of the whole group, not an internal rearrangement', () => {
    // mock — same shape as above, but this time BOTH a and b were part of the drag (e.g. a
    // mixed-selection drag that grabbed every member of the group individually) — the group's own
    // shape is unchanged, only its position moved, so forcing it back into its auto-layout slot
    // would fight the user's own drag instead of reacting to a real internal size change
    const frameId = addAutoLayoutFrame(0, 0);
    const groupId = addGroup(0, 0);
    const idA = addRect(0, 0);
    const idB = addRect(20, 0);
    const idC = addRect(0, 0);
    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [idC], targetIndex: 1, targetParentId: frameId }));

    // simulate both a and b having been dragged together, rigidly, by the same delta
    store.dispatch({ payload: { changes: { x: 500 }, id: idA }, type: 'design/updateNode' });
    store.dispatch({ payload: { changes: { x: 520 }, id: idB }, type: 'design/updateNode' });

    // action — both group members were part of this drag
    resyncGroupAutoLayoutAncestors(store.dispatch, [idA, idB]);

    // result — no reflow: 'c' stays exactly where it landed when it was first inserted (right after
    // the group's original 0..40 span), and the group's own box is left wherever the drag put it
    const page = selectActivePage(store.getState());
    expect(page.nodes[idC]).toMatchObject({ x: 40 });
    expect(page.nodes[idA]).toMatchObject({ x: 500 });
  });

  it('should NOT reflow the auto-layout frame when a single-child group’s only child is dragged — moving the group’s entire content is a rigid move too', () => {
    // mock — group-1 has just one child; dragging it freely must stay fully sealed off, matching
    // the same isolation guarantee a lone dragged group gets
    const frameId = addAutoLayoutFrame(0, 0);
    const groupId = addGroup(0, 0);
    const idA = addRect(0, 0);
    const idC = addRect(0, 0);
    store.dispatch(moveNodes({ nodeIds: [idA], targetIndex: 0, targetParentId: groupId }));
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(moveNodes({ nodeIds: [idC], targetIndex: 1, targetParentId: frameId }));

    store.dispatch({ payload: { changes: { x: 900, y: 900 }, id: idA }, type: 'design/updateNode' });

    // action
    resyncGroupAutoLayoutAncestors(store.dispatch, [idA]);

    // result — 'c' is untouched, and 'a' stays exactly where the drag left it
    const page = selectActivePage(store.getState());
    expect(page.nodes[idC]).toMatchObject({ x: 20 });
    expect(page.nodes[idA]).toMatchObject({ x: 900, y: 900 });
  });
});
