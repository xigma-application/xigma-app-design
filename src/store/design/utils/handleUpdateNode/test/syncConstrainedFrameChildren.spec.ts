// store
import { addNode, deleteNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { AlignmentHorizontal, AlignmentVertical, LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

// utils
import { getNodePositionInParent } from '../../getNodePositionInParent';

const addFrame = (x: number, y: number, width: number, height: number, layoutMode?: LayoutMode): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ffffff',
      height,
      layoutMode,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width,
      x,
      y,
    }),
  );

  return selectActivePage(store.getState()).rootOrder.at(-1) as string;
};

const addChildRect = (frameId: string, x: number, y: number, width = 40, height = 40): string => {
  store.dispatch(addNode({ fill: '#ff0000', height, name: 'Rect', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }));

  const childId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

  store.dispatch(moveNodes({ nodeIds: [childId], targetIndex: 0, targetParentId: frameId }));

  return childId;
};

const rect = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;
const frame = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('syncConstrainedFrameChildren (via updateNode)', () => {
  beforeEach(() => {
    selectActivePage(store.getState())
      .rootOrder.slice()
      .forEach((id) => store.dispatch(deleteNode(id)));
    store.dispatch(setSelection([]));
  });

  it('should skip a non-box child (a line has no x/y/width/height to constrain)', () => {
    const frameId = addFrame(100, 100, 400, 200);

    store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 }));

    const lineId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    store.dispatch(moveNodes({ nodeIds: [lineId], targetIndex: 0, targetParentId: frameId }));

    expect(() => store.dispatch(updateNode({ changes: { width: 500 }, id: frameId }))).not.toThrow();
  });

  it('should not move an unconstrained (default left/top) child when only the right edge moves', () => {
    const frameId = addFrame(100, 100, 400, 200);
    const childId = addChildRect(frameId, 130, 130);

    store.dispatch(updateNode({ changes: { width: 500 }, id: frameId })); // right edge only

    expect(rect(childId).x).toBe(130);
    expect(rect(childId).y).toBe(130);
  });

  it('should carry an unconstrained child along with the left edge, the same as the origin move', () => {
    const frameId = addFrame(100, 100, 400, 200);
    const childId = addChildRect(frameId, 130, 130);

    // a left-edge drag: x moves left by 40, width grows by 40, in the same dispatch
    store.dispatch(updateNode({ changes: { width: 440, x: 60 }, id: frameId }));

    expect(rect(childId).x).toBe(90); // 130 - 40
    expect(rect(childId).y).toBe(130); // vertical edge untouched
  });

  it('should preserve a right-anchored child’s gap from the right edge as the frame widens', () => {
    const frameId = addFrame(100, 100, 400, 200);
    const childId = addChildRect(frameId, 350, 130); // local x 250, gap to right edge = 400 - 250 - 40 = 110... use explicit local

    store.dispatch(updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.right } }, id: childId }));

    store.dispatch(updateNode({ changes: { width: 500 }, id: frameId })); // +100

    // the child rides the full width delta, so its gap to the right edge is unchanged
    expect(rect(childId).x).toBe(450); // 350 + 100
  });

  it('should preserve a centre-anchored child’s offset from the parent centre as the frame widens', () => {
    const frameId = addFrame(100, 100, 400, 200);
    const childId = addChildRect(frameId, 300, 130); // local x 200 == exact centre-ish reference

    store.dispatch(updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.center } }, id: childId }));
    store.dispatch(updateNode({ changes: { width: 600 }, id: frameId })); // +200

    expect(rect(childId).x).toBe(400); // 300 + 200 / 2
  });

  it('should not move anything just because an alignment is set — only a frame box change triggers a reflow', () => {
    const frameId = addFrame(100, 100, 400, 200);
    const childId = addChildRect(frameId, 130, 130);

    store.dispatch(updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.center } }, id: childId }));

    expect(rect(childId).x).toBe(130);
  });

  it('should re-anchor a rotated parent’s child in its own unrotated local space', () => {
    const frameId = addFrame(100, 100, 400, 200);
    const childId = addChildRect(frameId, 130, 130);

    store.dispatch(updateNode({ changes: { rotation: 90 }, id: frameId }));

    const localBeforeResize = getNodePositionInParent(rect(childId), frame(frameId));

    store.dispatch(updateNode({ changes: { width: 500 }, id: frameId })); // right edge, local x unaffected for a default child

    const localAfterResize = getNodePositionInParent(rect(childId), frame(frameId));

    expect(localAfterResize.x).toBeCloseTo(localBeforeResize.x, 0);
    expect(localAfterResize.y).toBeCloseTo(localBeforeResize.y, 0);
  });

  it('should not touch a child whose parent runs an auto layout', () => {
    const frameId = addFrame(100, 100, 400, 200, LayoutMode.horizontal);
    const childId = addChildRect(frameId, 130, 130);

    store.dispatch(updateNode({ changes: { width: 500 }, id: frameId }));

    // the auto-layout engine (not the constraint sync) owns this child's position
    expect(rect(childId).x).not.toBe(130);
  });

  it('should translate a nested child subtree as a whole', () => {
    const frameId = addFrame(0, 0, 400, 200);

    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#00ff00',
        height: 100,
        name: 'Inner',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 100,
        x: 300,
        y: 20,
      }),
    );

    const innerId = selectActivePage(store.getState()).rootOrder.at(-1) as string;

    store.dispatch(moveNodes({ nodeIds: [innerId], targetIndex: 0, targetParentId: frameId }));
    store.dispatch(updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.right } }, id: innerId }));

    const leafId = addChildRect(innerId, 340, 40, 20, 20); // grandchild, absolute (340, 40)

    expect(rect(leafId).x).toBe(340);

    store.dispatch(updateNode({ changes: { width: 500 }, id: frameId })); // +100

    // inner rides the full delta (right-anchored); the leaf rides along with it
    expect(frame(innerId).x).toBe(400);
    expect(rect(leafId).x).toBe(440);
  });

  it('should keep both axes anchored independently', () => {
    const frameId = addFrame(0, 0, 400, 200);
    const childId = addChildRect(frameId, 350, 150); // near the bottom-right

    store.dispatch(
      updateNode({ changes: { alignment: { horizontal: AlignmentHorizontal.right, vertical: AlignmentVertical.bottom } }, id: childId }),
    );
    store.dispatch(updateNode({ changes: { height: 260, width: 500 }, id: frameId })); // +100 / +60

    expect(rect(childId).x).toBe(450);
    expect(rect(childId).y).toBe(210);
  });
});
