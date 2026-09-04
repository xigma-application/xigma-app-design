// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';

// utils
import { getRotatedAnchorSolver } from '../../getRotatedAnchorSolver';
import { resizeBoxNode } from '../resizeBoxNode';

const addFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrameNode = (): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 100,
      itemSpacing: 10,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectNode = (width: number, height: number): string => {
  store.dispatch(
    addNode({ fill: '#00ff00', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addMediaNode = (): string => {
  store.dispatch(
    addNode({
      flipX: false,
      flipY: false,
      height: 100,
      name: 'Image',
      parentId: null,
      rotation: 0,
      src: 'a.png',
      type: NodeType.media,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('resizeBoxNode', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should resize a single unrotated node using the plain (non-solver) position formula', () => {
    // mock
    const idA = addFrameNode();

    // before
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      1.5,
      1.6,
      true,
      null,
    );

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({
      height: 80,
      width: 150,
      x: 0,
      y: 0,
    });
  });

  it('should toggle flip when the drag crosses the anchor', () => {
    // mock
    const idMedia = addMediaNode();

    // before — negative scaleX signals a crossed anchor on the X axis only
    resizeBoxNode(
      idMedia,
      { flip: { x: false, y: false }, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      -0.3,
      1,
      true,
      null,
    );

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idMedia]).toMatchObject({ flipX: true, flipY: false });
  });

  it('should use the rotated anchor solver for a single rotated node, when one is provided', () => {
    // mock
    const idA = addFrameNode();
    const solver = getRotatedAnchorSolver({ height: 50, width: 100, x: 0, y: 0 }, 'e', 90, 2, 1);

    // before
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      2,
      1,
      true,
      solver,
    );

    // result — matches getRotatedAnchorSolver's own directly-verified output for these inputs
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as {
      height: number;
      width: number;
      x: number;
      y: number;
    };

    expect(node).toMatchObject({ height: 50, width: 200 });
    expect(node.x).toBeCloseTo(-50);
    expect(node.y).toBeCloseTo(50);
  });

  it("should project the world scale onto a rotated GROUP member's own local axes, not use it raw", () => {
    // mock
    const idA = addFrameNode();

    // before — no solver (group path); scaleX=2/scaleY=1 in world space, member rotated 90deg
    resizeBoxNode(
      idA,
      { flip: null, height: 50, rotation: 90, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: null },
      2,
      1,
      false,
      null,
    );

    // result — matches the end-to-end "grow a rotated GROUP MEMBER..." case in continueResizeDrag.spec.ts
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({
      height: 100,
      width: 100,
      x: 50,
      y: -25,
    });
  });

  it('should reflow an auto-layout frame’s children live, in the same dispatch, when the frame itself is resized', () => {
    // mock — a horizontal, right-packed auto-layout frame with two children
    const frameId = addAutoLayoutFrameNode();
    const idA = addRectNode(30, 20);
    const idB = addRectNode(40, 20);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(updateNode({ changes: { layoutAlignment: AlignmentLayout.topRight }, id: frameId }));

    // before — the frame widens from 100 to 200, anchored at its own top-left corner
    resizeBoxNode(
      frameId,
      { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 },
      store.dispatch,
      { x: 0, y: 0 },
      2,
      1,
      true,
      null,
    );

    // result — right-packed content (30+10+40=80) re-anchors against the new, wider right edge
    const page = selectActivePage(store.getState());
    expect(page.nodes[frameId]).toMatchObject({ width: 200 });
    expect(page.nodes[idA]).toMatchObject({ x: 120 });
    expect(page.nodes[idB]).toMatchObject({ x: 160 });
  });

  it('should reflow an auto-layout frame’s other children live, in the same dispatch, when one child is resized', () => {
    // mock — a horizontal auto-layout frame with two children, left-packed (the default)
    const frameId = addAutoLayoutFrameNode();
    const idA = addRectNode(30, 20);
    const idB = addRectNode(40, 20);

    store.dispatch(moveNodes({ nodeIds: [idA, idB], targetIndex: 0, targetParentId: frameId }));

    // before — child a doubles in width (30 -> 60)
    resizeBoxNode(idA, { flip: null, height: 20, rotation: 0, width: 30, x: 0, y: 0 }, store.dispatch, { x: 0, y: 0 }, 2, 1, true, null);

    // result — b is pushed along by a's new width, without being resized itself
    const page = selectActivePage(store.getState());
    expect(page.nodes[idA]).toMatchObject({ width: 60 });
    expect(page.nodes[idB]).toMatchObject({ width: 40, x: 70 });
  });
});
