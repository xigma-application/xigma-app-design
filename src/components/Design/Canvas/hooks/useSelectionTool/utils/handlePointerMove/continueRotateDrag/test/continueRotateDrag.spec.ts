import { RefObject } from 'react';

// store
import { addNode, groupNodes, setImageEditor, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';
import { TRotateDragState } from 'types/design/selectionTool/types';
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { getLineBoxFromPoints } from 'utils/canvas/line/getLineBoxFromPoints';
import { getLinePoints } from 'utils/canvas/line/getLinePoints';
import { getLastAddedNodeId } from 'test/getLastAddedNodeId';
import { continueRotateDrag } from '../continueRotateDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createRotateDragRef = (rotateDragState: TRotateDragState | null = null): RefObject<TRotateDragState | null> => ({
  current: rotateDragState,
});

const addFrameNode = (x: number, y: number, width: number, height: number, rotation = 0, parentId: string | null = null): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      height,
      name: 'Frame',
      parentId,
      rotation,
      type: NodeType.frame,
      width,
      x,
      y,
    }),
  );

  return getLastAddedNodeId(store.getState());
};

const addImageRectangleNode = (
  x: number,
  y: number,
  width: number,
  height: number,
  crop: { height: number; rotation: number; width: number; x: number; y: number },
): string => {
  store.dispatch(
    addNode({
      fills: [{ crop, opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width,
      x,
      y,
    }),
  );

  return getLastAddedNodeId(store.getState());
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number, parentId: string | null = null): string => {
  store.dispatch(
    addNode({
      name: 'Line',
      parentId,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
      type: NodeType.line,
      ...getLineBoxFromPoints({ x1, x2, y1, y2 }),
    }),
  );

  return getLastAddedNodeId(store.getState());
};

describe('continueRotateDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setImageEditor(null));
  });

  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueRotateDrag(canvas, pointerEvent(10, 10), store.dispatch, createRotateDragRef(), createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should spin a single node in place around its own center, position unchanged', () => {
    // mock — pivot equals the node's own center (50, 50); pointer starts due east (angle 0)
    const idA = addFrameNode(0, 0, 100, 100);
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idA]: { height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    // before — pointer moves due south of the pivot (angle 90), a 90deg delta
    continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result — position collapses back to the same x/y, only rotation changes
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({
      height: 100,
      rotation: 90,
      width: 100,
      x: 0,
      y: 0,
    });
  });

  it('should accumulate on top of a node that already had a non-zero rotation', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 100, 30);
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idA]: { height: 100, rotation: 30, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    // before
    continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ rotation: 120 });
  });

  it('should carry an image fill’s crop rect along live, for a plain (non-snapshotted) node rotating through direct dispatch', () => {
    // mock — a 100x100 node with a crop rect exactly matching its own bounds, pivoting 90° around
    // its own center (50,50)
    const idA = addImageRectangleNode(0, 0, 100, 100, { height: 100, rotation: 0, width: 100, x: 0, y: 0 });
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idA]: { height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    // before
    continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TRectangleNode;
    const crop = node.fills[0].type === 'image' ? node.fills[0].crop : undefined;

    expect(node.rotation).toBe(90);
    expect(crop?.rotation).toBe(90);
    expect(crop?.x).toBeCloseTo(0);
    expect(crop?.y).toBeCloseTo(0);
  });

  it('should not compound the crop rotation across repeated pointermove frames of the same drag (regression: re-reading the already-rotated live fills every frame stacked the rotation on top of itself)', () => {
    // mock — same node as above, but the drag continues across two separate pointermove frames:
    // first to a 90° total delta, then to a 180° total delta
    const idA = addImageRectangleNode(0, 0, 100, 100, { height: 100, rotation: 0, width: 100, x: 0, y: 0 });
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idA]: { height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    // before — two frames of the same live drag
    continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, createCanvasRefs());
    continueRotateDrag(canvas, pointerEvent(-50, 50), store.dispatch, rotateDragRef, createCanvasRefs());

    // result — the crop must land on the final 180° total, not 90+180=270 from compounding
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TRectangleNode;
    const crop = node.fills[0].type === 'image' ? node.fills[0].crop : undefined;

    expect(node.rotation).toBe(180);
    expect(crop?.rotation).toBe(180);
  });

  it("should leave the image editor's crop in place when its frame is rotated while that node's image editor is active in crop mode (regression: rotating the frame dragged the crop's own rotation/position along with it)", () => {
    // mock
    const idA = addImageRectangleNode(0, 0, 100, 100, { height: 100, rotation: 0, width: 100, x: 0, y: 0 });

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: idA, paintIndex: 0 }));

    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idA]: { height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    // before — a 90deg delta on the frame
    continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result — the frame rotated, but the crop stayed exactly as it was
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TRectangleNode;
    const crop = node.fills[0].type === 'image' ? node.fills[0].crop : undefined;

    expect(node.rotation).toBe(90);
    expect(crop).toEqual({ height: 100, rotation: 0, width: 100, x: 0, y: 0 });
  });

  it('should orbit each member of a group around the shared pivot, spinning each individually', () => {
    // mock — A's center (50, 50) sits directly west of the shared pivot (150, 50); B's center
    // (250, 50) sits directly east of it
    const idA = addFrameNode(0, 0, 100, 100, 0, 'parent-1');
    const idB = addFrameNode(200, 0, 100, 100, 0, 'parent-1');
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: {
        [idA]: { height: 100, rotation: 0, width: 100, x: 0, y: 0 },
        [idB]: { height: 100, rotation: 0, width: 100, x: 200, y: 0 },
      },
      pivot: { x: 150, y: 50 },
      startAngle: 0,
    });

    // before — a 90deg delta (pointer moves from due east to due south of the pivot)
    continueRotateDrag(canvas, pointerEvent(150, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result — A swings from west to north of the pivot, B swings from east to south; both spin
    // by the same 90deg
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ rotation: 90, x: 100, y: -100 });
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idB]).toMatchObject({ rotation: 90, x: 100, y: 100 });
  });

  it('should rotate a line by its endpoints instead of an x/y/rotation triple', () => {
    // mock — a vertical line whose own center (100, 50) is the pivot
    const idLine = addLineNode(100, 0, 100, 100, 'parent-1');
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idLine]: { x1: 100, x2: 100, y1: 0, y2: 100 } },
      pivot: { x: 100, y: 50 },
      startAngle: 0,
    });

    // before — a 90deg delta turns the vertical line horizontal
    continueRotateDrag(canvas, pointerEvent(100, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result
    const line = getLinePoints(store.getState().design.pages[store.getState().design.activePageId].nodes[idLine] as TLineNode);

    expect(line.x1).toBeCloseTo(150);
    expect(line.y1).toBeCloseTo(50);
    expect(line.x2).toBeCloseTo(50);
    expect(line.y2).toBeCloseTo(50);
  });

  it('should re-pin a rotated group’s height/width to its own origin instead of letting them drift', () => {
    // mock — a group whose own id is among the rotated origins (the group itself was selected and
    // dragged by its rotate handle, not just an individual child)
    const idA = addFrameNode(0, 0, 100, 100, 0, 'parent-1');
    const idB = addFrameNode(200, 0, 100, 100, 0, 'parent-1');

    store.dispatch(setSelection([idA, idB]));
    store.dispatch(groupNodes());

    const [groupId] = selectActivePage(store.getState()).selectedIds;
    const group = selectActivePage(store.getState()).nodes[groupId] as { height: number; width: number; x: number; y: number };
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [groupId]: { height: group.height, rotation: 0, width: group.width, x: group.x, y: group.y } },
      pivot: { x: group.x + group.width / 2, y: group.y + group.height / 2 },
      startAngle: 0,
    });

    // before — spin the group 90deg in place around its own center
    continueRotateDrag(
      canvas,
      pointerEvent(group.x + group.width / 2, group.y + group.height / 2 + 100),
      store.dispatch,
      rotateDragRef,
      createCanvasRefs(),
    );

    // result — height/width land back on the origin's own values, not whatever the generic
    // rotation math produced for them
    expect(selectActivePage(store.getState()).nodes[groupId]).toMatchObject({
      height: group.height,
      rotation: 90,
      width: group.width,
    });
  });

  describe('vector node rotate snapshots', () => {
    const buildSnapshot = (): TVectorNodeRotateSnapshot => ({
      deltaDegrees: 0,
      facesByPaint: [],
      pivot: { x: 50, y: 50 },
      strokeVertices: [],
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
    });

    it('should update a snapshotted vector node’s delta and mark it as rotated, without touching the store at all', () => {
      // mock
      const idA = addFrameNode(0, 0, 100, 100);
      const canvas = createCanvas();
      const rotateDragRef = createRotateDragRef({
        cursorAngle: 0,
        nodeOrigins: { [idA]: { bakesRotation: false, fillRotation: 0, rotation: 0, segments: {}, vertices: {} } },
        pivot: { x: 50, y: 50 },
        startAngle: 0,
      });
      const canvasRefs = createCanvasRefs();
      const snapshot = buildSnapshot();

      canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([[idA, snapshot]]);

      const nodeBefore = store.getState().design.pages[store.getState().design.activePageId].nodes[idA];

      // before — a 90deg delta
      continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, canvasRefs);

      // result — the store node is untouched, but the snapshot itself now reflects the live drag
      expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toBe(nodeBefore);
      expect(snapshot.deltaDegrees).toBeCloseTo(90);
      expect(canvasRefs.transform.rotatedNodeIdsRef.current).toEqual(new Set([idA]));
    });

    it('should not replace an already-initialized rotated-node-ids set on a subsequent pointermove', () => {
      // mock
      const idA = addFrameNode(0, 0, 100, 100);
      const canvas = createCanvas();
      const rotateDragRef = createRotateDragRef({
        cursorAngle: 0,
        nodeOrigins: { [idA]: { bakesRotation: false, fillRotation: 0, rotation: 0, segments: {}, vertices: {} } },
        pivot: { x: 50, y: 50 },
        startAngle: 0,
      });
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([[idA, buildSnapshot()]]);

      const existingSet = new Set(['some-other-id']);

      canvasRefs.transform.rotatedNodeIdsRef.current = existingSet;

      // before
      continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, canvasRefs);

      // result
      expect(canvasRefs.transform.rotatedNodeIdsRef.current).toBe(existingSet);
    });

    it('should still dispatch normally for a non-snapshotted node in the same rotate gesture as a snapshotted one', () => {
      // mock — a mixed selection: one vector node fast-pathed via a snapshot, one plain frame rotated live
      const idVector = addFrameNode(0, 0, 100, 100, 0, 'parent-1');
      const idFrame = addFrameNode(200, 0, 100, 100, 0, 'parent-1');
      const canvas = createCanvas();
      const rotateDragRef = createRotateDragRef({
        cursorAngle: 0,
        nodeOrigins: {
          [idFrame]: { height: 100, rotation: 0, width: 100, x: 200, y: 0 },
          [idVector]: { bakesRotation: false, fillRotation: 0, rotation: 0, segments: {}, vertices: {} },
        },
        pivot: { x: 150, y: 50 },
        startAngle: 0,
      });
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([[idVector, buildSnapshot()]]);

      // before — a 90deg delta
      continueRotateDrag(canvas, pointerEvent(150, 150), store.dispatch, rotateDragRef, canvasRefs);

      // result — the frame still rotated live through the store, the vector node's store entry is untouched
      expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idFrame]).toMatchObject({ rotation: 90 });
    });
  });
});
