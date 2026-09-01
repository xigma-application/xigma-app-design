// store
import { addNode, groupNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { applyRotatedGroupChildResize } from '../applyRotatedGroupChildResize';

describe('applyRotatedGroupChildResize', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should dispatch scaled changes for every child origin when the group resolves to a box node', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#00ff00', height: 20, name: 'B', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 60, y: 0 }),
    );

    const childIds = selectActivePage(store.getState()).rootOrder.slice(-2);

    store.dispatch(setSelection(childIds));
    store.dispatch(groupNodes());

    const [groupId] = selectSelectedIds(store.getState());

    store.dispatch(updateNode({ changes: { height: 20, width: 160, x: 0, y: 0 }, id: groupId }));

    // before
    applyRotatedGroupChildResize(
      groupId,
      { flip: null, height: 20, rotation: 0, width: 80, x: 0, y: 0 },
      { [childIds[0]]: { flip: null, height: 20, rotation: 0, width: 20, x: 0, y: 0 } },
      store.dispatch,
    );

    // result
    const child = selectActivePage(store.getState()).nodes[childIds[0]] as TRectangleNode;
    expect(child.width).toBe(40);
  });

  it("should re-assert the group's own precise box last, so syncGroupBounds's rounded-corner recompute (triggered by each child dispatch) doesn't leave the group box drifted off the exact anchor-preserving box just computed for it", () => {
    // mock — a 30deg-rotated group with two 30deg-rotated children, mid rotated-resize drag: the
    // group's own box was already dispatched this frame (by resizeBoxNode, read below as newGroupBox)
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 40,
        name: 'A',
        parentId: null,
        rotation: 30,
        type: NodeType.frame,
        width: 80,
        x: 708.0384757729337,
        y: 270,
      }),
    );
    store.dispatch(
      addNode({
        fill: '#00ff00',
        height: 40,
        name: 'B',
        parentId: null,
        rotation: 30,
        type: NodeType.frame,
        width: 80,
        x: 811.9615242270663,
        y: 330,
      }),
    );

    const childIds = selectActivePage(store.getState()).rootOrder.slice(-2);

    store.dispatch(setSelection(childIds));
    store.dispatch(groupNodes());

    const [groupId] = selectSelectedIds(store.getState());
    const newGroupBox = { height: 40.58399310102939, rotation: 30, width: 265.01150572225265, x: 695.4942471388737, y: 316.2080034494853 };

    store.dispatch(updateNode({ changes: newGroupBox, id: groupId }));

    // before
    applyRotatedGroupChildResize(
      groupId,
      { flip: null, height: 40, rotation: 30, width: 200, x: 700, y: 300 },
      {
        [childIds[0]]: { flip: null, height: 40, rotation: 30, width: 80, x: 708.0384757729337, y: 270 },
        [childIds[1]]: { flip: null, height: 40, rotation: 30, width: 80, x: 811.9615242270663, y: 330 },
      },
      store.dispatch,
    );

    // result — the group's box still matches newGroupBox exactly, not some AABB recomputed from the
    // (now rounded-to-the-pixel) children
    const group = selectActivePage(store.getState()).nodes[groupId];

    expect(group).toMatchObject(newGroupBox);
  });

  it('should do nothing when the group id no longer resolves to a node', () => {
    // before / result
    expect(() =>
      applyRotatedGroupChildResize(
        'missing',
        { flip: null, height: 20, rotation: 0, width: 80, x: 0, y: 0 },
        { a: { flip: null, height: 20, rotation: 0, width: 20, x: 0, y: 0 } },
        store.dispatch,
      ),
    ).not.toThrow();
  });

  it('should do nothing when the group origin has no width (a vector origin, never actually a group)', () => {
    // before / result
    expect(() =>
      applyRotatedGroupChildResize(
        'group-1',
        { rotation: 0, segments: {}, vertices: {} },
        { a: { flip: null, height: 20, rotation: 0, width: 20, x: 0, y: 0 } },
        store.dispatch,
      ),
    ).not.toThrow();
  });
});
