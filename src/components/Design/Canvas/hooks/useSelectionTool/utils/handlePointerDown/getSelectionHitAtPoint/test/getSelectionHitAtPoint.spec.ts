// store
import { addNode, groupNodes, moveNodes, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectOrderedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getSelectionHitAtPoint } from '../getSelectionHitAtPoint';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const addFrameNode = (x: number, y: number, size = 100): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: size,
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

const addClosedSquareVectorNode = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x, y },
        v2: { id: 'v2', x: x + size, y },
        v3: { id: 'v3', x: x + size, y: y + size },
        v4: { id: 'v4', x, y: y + size },
      },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('getSelectionHitAtPoint', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setSelection([]));
  });

  it('should return the hit node as-is when it is not the one currently being vector-edited', () => {
    // mock
    const idA = addFrameNode(0, 0);

    // action
    const hit = getSelectionHitAtPoint({ x: 50, y: 50 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result — a plain frame is never affected by vectorEditingNodeId
    expect(hit?.id).toBe(idA);
  });

  it('should null out a hit on the contour of the node currently open in Vector Edit Mode', () => {
    // mock — left edge of a closed 100x100 square
    const idA = addClosedSquareVectorNode(200, 200, 100);

    store.dispatch(setVectorEditingNodeIds([idA]));

    // action
    const hit = getSelectionHitAtPoint({ x: 200, y: 250 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit).toBeNull();
  });

  it('should still return a hit on that same vector node when it is not the one being edited', () => {
    // mock — a point on the square's own contour, since an unfilled region only collides on its outline
    const idA = addClosedSquareVectorNode(400, 200, 100);

    // action — no setVectorEditingNodeIds dispatched
    const hit = getSelectionHitAtPoint({ x: 400, y: 250 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).toBe(idA);
  });

  it('should return null when nothing is hit at all, regardless of vector editing state', () => {
    // action
    const hit = getSelectionHitAtPoint({ x: 9000, y: 9000 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit).toBeNull();
  });

  it('should resolve a hit on a child up to its top-level group when none of its children are selected', () => {
    // mock
    const idA = addFrameNode(500000, 500000, 20);
    const idB = addFrameNode(500100, 500000, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([]));

    // action
    const hit = getSelectionHitAtPoint({ x: 500010, y: 500010 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).not.toBe(idA);
    expect(hit?.type).toBe(NodeType.group);
  });

  it('should bypass the group and return the specific child once one of its children is already selected', () => {
    // mock
    const idA = addFrameNode(600000, 600000, 20);
    const idB = addFrameNode(600100, 600000, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([idA]));

    // action — hitting the OTHER child while the first one is selected
    const hit = getSelectionHitAtPoint({ x: 600110, y: 600010 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).toBe(idB);
  });

  it('should fall back to the group itself when an entered group is hit on empty padding that covers no child', () => {
    // mock
    const idA = addFrameNode(610000, 610000, 20);
    const idB = addFrameNode(610100, 610000, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([idA]));

    // action — the gap between the two children, still inside the group’s union bounding box
    const hit = getSelectionHitAtPoint({ x: 610060, y: 610010 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).not.toBe(idA);
    expect(hit?.id).not.toBe(idB);
    expect(hit?.type).toBe(NodeType.group);
  });

  it('should still resolve to the group itself when the group node is selected directly, not one of its children', () => {
    // mock
    const idA = addFrameNode(700000, 700000, 20);
    const idB = addFrameNode(700100, 700000, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());

    // action — selection now holds the group's own id, not a child
    const hit = getSelectionHitAtPoint({ x: 700010, y: 700010 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).not.toBe(idA);
    expect(hit?.type).toBe(NodeType.group);
  });

  it('should still resolve to the group when a group child is selected together with an unrelated node', () => {
    // mock — a child dragged together with an unrelated sibling (e.g. [1,2] grouped, 2 and 3 both
    // selected and moved) must not leave the group permanently "entered" for its other children
    const idA = addFrameNode(800000, 800000, 20);
    const idB = addFrameNode(800100, 800000, 20);
    const idC = addFrameNode(800300, 800000, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([idB, idC]));

    // action — hitting idA, the group's OTHER (unmoved) child
    const hit = getSelectionHitAtPoint({ x: 800010, y: 800010 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).not.toBe(idA);
    expect(hit?.type).toBe(NodeType.group);
  });

  it('should resolve to the child itself when clicking directly on it, even while selected together with an unrelated node', () => {
    // mock — [1,2] grouped, 2 and 3 both selected and dragged together; clicking directly on the
    // already-selected group child 2 again must keep hitting it (so the drag can continue on the
    // whole [2,3] selection), not jump to the group just because the selection isn’t "entered"
    const idA = addFrameNode(900000, 900000, 20);
    const idB = addFrameNode(900100, 900000, 20);
    const idC = addFrameNode(900300, 900000, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    store.dispatch(setSelection([idB, idC]));

    // action — hitting idB, the already-selected child, directly
    const hit = getSelectionHitAtPoint({ x: 900110, y: 900010 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).toBe(idB);
  });

  it('should let a plain click fall through to an unselected sibling drawn on top of the selected node', () => {
    // mock — a big A with a small B fully inside it; B is added last, so it paints on top of A
    const idA = addFrameNode(1100000, 1100000, 200);
    const idB = addFrameNode(1100050, 1100050, 40);

    store.dispatch(setSelection([idA]));

    // action — the point lands where both A and B sit, but B is the top-most node there
    const hit = getSelectionHitAtPoint({ x: 1100070, y: 1100070 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result — the already-selected A no longer swallows the click
    expect(hit?.id).toBe(idB);
  });

  it('should still return the selected node for a plain click on a spot no other node covers', () => {
    // mock — same layout, but this time we click A where the smaller B does not reach
    const idA = addFrameNode(1200000, 1200000, 200);
    addFrameNode(1200050, 1200050, 40);

    store.dispatch(setSelection([idA]));

    // action
    const hit = getSelectionHitAtPoint({ x: 1200010, y: 1200010 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).toBe(idA);
  });

  it('should resolve to a three-levels-deep nested group when it is selected directly and clicked on its own bounds', () => {
    // mock — group-3 (containing idA/idB) wrapped in group-2, wrapped again in group-1; group-3 stays
    // selected the whole time, so clicking its own visible area must keep hitting group-3, not the
    // outermost group-1 and not one of its own leaf children
    const idA = addFrameNode(1000000, 1000000, 20);
    const idB = addFrameNode(1000100, 1000000, 20);

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());
    const [group3Id] = selectActivePage(store.getState()).selectedIds;

    store.dispatch(groupNodes());
    store.dispatch(groupNodes());
    store.dispatch(setSelection([group3Id]));

    // action — click well within group-3's own bounds (idA's own area)
    const hit = getSelectionHitAtPoint({ x: 1000010, y: 1000010 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

    // result
    expect(hit?.id).toBe(group3Id);
  });

  describe('a frame that has children', () => {
    const addRectNode = (x: number, y: number, size: number): string => {
      store.dispatch(
        addNode({
          fill: '#00ff00',
          height: size,
          name: 'Rectangle',
          parentId: null,
          rotation: 0,
          type: NodeType.rectangle,
          width: size,
          x,
          y,
        }),
      );

      return selectActivePage(store.getState()).rootOrder.at(-1) as string;
    };

    const buildFrameWithChild = (): { childId: string; frameId: string } => {
      const frameId = addFrameNode(20000, 20000, 400);
      const childId = addRectNode(20020, 20020, 40);

      store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: frameId }));
      store.dispatch(setSelection([]));

      return { childId, frameId };
    };

    it('should not select the frame from a plain click on its empty body — it selects nothing there', () => {
      const { frameId } = buildFrameWithChild();

      const hit = getSelectionHitAtPoint({ x: 20300, y: 20300 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit).toBeNull();
      expect(hit?.id).not.toBe(frameId);
    });

    it('should select the child directly on the first click on that child', () => {
      const { childId } = buildFrameWithChild();

      const hit = getSelectionHitAtPoint({ x: 20035, y: 20035 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(childId);
    });

    it('should still select the frame from a click on its name label', () => {
      const { frameId } = buildFrameWithChild();

      // ~17px above the frame's top-left corner at zoom 1 — where the name label sits
      const hit = getSelectionHitAtPoint({ x: 20008, y: 19990 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(frameId);
    });

    it('should still let a body click re-grab the frame while it is already selected, when no child sits under the pointer', () => {
      const { frameId } = buildFrameWithChild();

      store.dispatch(setSelection([frameId]));
      const hit = getSelectionHitAtPoint({ x: 20300, y: 20300 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(frameId);
    });

    it('should hand selection to the child clicked inside a frame that is itself currently selected', () => {
      const { childId, frameId } = buildFrameWithChild();

      store.dispatch(setSelection([frameId]));
      const hit = getSelectionHitAtPoint({ x: 20035, y: 20035 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(childId);
    });

    it('should keep selecting an empty frame from a plain click on its body, unchanged', () => {
      const frameId = addFrameNode(21000, 21000, 200);
      store.dispatch(setSelection([]));

      const hit = getSelectionHitAtPoint({ x: 21100, y: 21100 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(frameId);
    });
  });

  describe('a frame nested directly inside another frame', () => {
    const addRectNodeAt = (x: number, y: number, size: number): string => {
      store.dispatch(
        addNode({
          fill: '#00ff00',
          height: size,
          name: 'Rectangle',
          parentId: null,
          rotation: 0,
          type: NodeType.rectangle,
          width: size,
          x,
          y,
        }),
      );

      return selectActivePage(store.getState()).rootOrder.at(-1) as string;
    };

    const buildNestedFrame = (): { deeperFrameId: string; nestedFrameId: string; outerFrameId: string } => {
      const outerFrameId = addFrameNode(22000, 22000, 400);
      const nestedFrameId = addFrameNode(22020, 22020, 200);
      const deeperFrameId = addFrameNode(22040, 22040, 40);

      store.dispatch(moveNodes({ nodeIds: [nestedFrameId], targetIndex: 0, targetParentId: outerFrameId }));
      store.dispatch(moveNodes({ nodeIds: [deeperFrameId], targetIndex: 0, targetParentId: nestedFrameId }));
      store.dispatch(setSelection([]));

      return { deeperFrameId, nestedFrameId, outerFrameId };
    };

    it('should select the nested frame directly from a plain click on its empty body, unlike a top-level frame', () => {
      const { nestedFrameId } = buildNestedFrame();

      // the nested frame's empty body, away from the deeper frame nested inside it
      const hit = getSelectionHitAtPoint({ x: 22190, y: 22190 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(nestedFrameId);
    });

    it('should select a frame nested two levels deep directly on a plain click, without needing Control — every frame is its own parent', () => {
      const { deeperFrameId } = buildNestedFrame();

      const hit = getSelectionHitAtPoint({ x: 22055, y: 22055 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(deeperFrameId);
    });

    it('should still reach the frame nested two levels deep on a plain click, even while the frame one level up is already selected', () => {
      const { deeperFrameId, nestedFrameId } = buildNestedFrame();

      store.dispatch(setSelection([nestedFrameId]));
      const hit = getSelectionHitAtPoint({ x: 22055, y: 22055 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(deeperFrameId);
    });

    it('should not reach actual (non-frame) content nested inside a two-levels-deep frame via a plain click', () => {
      const { deeperFrameId } = buildNestedFrame();
      const rectId = addRectNodeAt(22045, 22045, 10);

      store.dispatch(moveNodes({ nodeIds: [rectId], targetIndex: 0, targetParentId: deeperFrameId }));
      store.dispatch(setSelection([]));

      // the click lands on the rect itself, but plain click can never reach past an opaque frame's own body
      const hit = getSelectionHitAtPoint({ x: 22048, y: 22048 }, selectOrderedNodes(store.getState()), IDENTITY_VIEWPORT);

      expect(hit?.id).toBe(deeperFrameId);
    });
  });
});
