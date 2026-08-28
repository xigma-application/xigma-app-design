// store
import { addNode, setPaintColor, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { continueVectorPaintDrag } from '../continueVectorPaintDrag';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

// a square (a-b-c-d) split by the a-c diagonal into two triangular faces: the upper-right (a,b,c) and
// the lower-left (a,c,d) — enough to prove a single stroke can paint more than one face
const addSplitSquareVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        diag: { endId: 'c', id: 'diag', startId: 'a', tangentEnd: null, tangentStart: null },
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
        s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 100, y: 100 },
        d: { id: 'd', x: 0, y: 100 },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

// same split square, but the upper-right triangle is already filled before the stroke starts — the
// pointerdown-time removal for an already-filled face is deferred (armVectorPaintOnPointerDown.ts),
// so this fixture models what the store already looks like once a drag reaches that face's interior
const addSplitSquareVectorNodeWithUpperRightFilled = (color: string): { nodeId: string; upperRightKey: string } => {
  const segments = {
    diag: { endId: 'c', id: 'diag', startId: 'a', tangentEnd: null, tangentStart: null },
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
  };
  const vertices = {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
  };
  const upperRightFace = deriveVectorFaces({
    fillColor: null,
    filledFaceKeys: [],
    id: 'probe',
    name: '',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  }).find((face) => face.pieceKeys.some((key) => key.startsWith('s1[')))!;
  const upperRightKey = getVectorFillLoopKey(upperRightFace.pieceKeys);

  store.dispatch(
    addNode({
      fillColor: null,
      fillColorOverrideByKey: { [upperRightKey]: color },
      filledFaceKeys: [upperRightKey],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    }),
  );

  const { rootOrder } = store.getState().design;

  return { nodeId: rootOrder[rootOrder.length - 1], upperRightKey };
};

// a square (a-b-c-d) plus a separate horizontal line crossing its left and right edges, both living in
// the same node — the crossing only exists virtually (render-time planarization) until it gets baked
const addSquareWithVirtualCrossingVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        line1: { endId: 'p2', id: 'line1', startId: 'p1', tangentEnd: null, tangentStart: null },
        s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
        s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
        s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
        s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        a: { id: 'a', x: 0, y: 0 },
        b: { id: 'b', x: 100, y: 0 },
        c: { id: 'c', x: 100, y: 100 },
        d: { id: 'd', x: 0, y: 100 },
        p1: { id: 'p1', x: -20, y: 50 },
        p2: { id: 'p2', x: 120, y: 50 },
      },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorPaintDrag', () => {
  afterEach(() => {
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPaintColor('#D9D9D9'));
  });

  it('should do nothing when no paint stroke is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    // before
    continueVectorPaintDrag(canvas, pointerEvent(10, 10), dispatch, canvasRefs);

    // result
    expect(canvasRefs.vectorPaint.vectorPaintPathRef.current).toBeNull();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should extend the stroke path and paint the newly-crossed face with the current paint color', () => {
    // mock
    const nodeId = addSplitSquareVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPaintColor('#00ff00'));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [{ x: 66, y: 33 }];

    // before — a first real move (past the drag threshold) primes the upper-right triangle as
    // already touched, then the drag proceeds into the lower-left triangle
    continueVectorPaintDrag(canvas, pointerEvent(70, 30), dispatch, canvasRefs);
    dispatch.mockClear();
    continueVectorPaintDrag(canvas, pointerEvent(33, 66), dispatch, canvasRefs);

    // result
    expect(canvasRefs.vectorPaint.vectorPaintPathRef.current).toEqual([
      { x: 66, y: 33 },
      { x: 70, y: 30 },
      { x: 33, y: 66 },
    ]);
    expect(dispatch).toHaveBeenCalledTimes(1);

    const action = dispatch.mock.calls[0][0];
    const changes = action.payload.changes as Partial<TVectorNode>;

    expect(action.payload.id).toBe(nodeId);
    expect(changes.filledFaceKeys).toHaveLength(1);
    expect(Object.values(changes.fillColorOverrideByKey!)).toEqual(['#00ff00']);
  });

  it('should track the path but not paint anything while movement stays under the drag threshold', () => {
    // mock
    const nodeId = addSplitSquareVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [{ x: 66, y: 33 }];

    // before — a sub-pixel jitter, well under MIN_DRAG_DISTANCE_PX
    continueVectorPaintDrag(canvas, pointerEvent(67, 34), dispatch, canvasRefs);

    // result — the path still tracks the move, but nothing gets painted yet
    expect(canvasRefs.vectorPaint.vectorPaintPathRef.current).toEqual([
      { x: 66, y: 33 },
      { x: 67, y: 34 },
    ]);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should paint every still-untouched face the extended path crosses in one move, in a single dispatch', () => {
    // mock — a fast mouse swipe can jump straight from one recorded point to the next, so the path
    // already spans both triangles before this move even runs
    const nodeId = addSplitSquareVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [
      { x: 66, y: 33 },
      { x: 33, y: 66 },
    ];

    // before
    continueVectorPaintDrag(canvas, pointerEvent(50, 50), dispatch, canvasRefs);

    // result — one dispatch paints both faces at once
    expect(dispatch).toHaveBeenCalledTimes(1);

    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toHaveLength(2);
    expect(canvasRefs.vectorPaint.touchedVectorPaintLoopKeysRef.current[nodeId].size).toBe(2);
    // both faces crossed by the stroke stay in the persistent highlight, keyed by node id
    expect(canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current![nodeId]).toHaveLength(2);
  });

  it('should leave an already-filled face filled (not duplicated) when the drag sweeps over it without having touched it yet this stroke', () => {
    // mock — the upper-right triangle was already filled before this stroke even started (e.g. it was
    // the pointerdown face on an already-filled loop, whose removal armVectorPaintOnPointerDown.ts
    // defers rather than dispatches — see that file's own fix); nothing has marked it "touched" yet
    const { nodeId, upperRightKey } = addSplitSquareVectorNodeWithUpperRightFilled('#ff0000');

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPaintColor('#00ff00'));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [{ x: 66, y: 33 }];

    // before — a real drag that stays inside the already-filled upper-right triangle
    continueVectorPaintDrag(canvas, pointerEvent(80, 20), dispatch, canvasRefs);

    // result — repainted with the current color exactly once, no duplicate filledFaceKeys entry
    expect(dispatch).toHaveBeenCalledTimes(1);

    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual([upperRightKey]);
    expect(changes.fillColorOverrideByKey![upperRightKey]).toBe('#00ff00');
  });

  it('should destroy the fill of every already-filled face the drag sweeps over while remove mode is armed', () => {
    // mock
    const { nodeId } = addSplitSquareVectorNodeWithUpperRightFilled('#ff0000');

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [{ x: 66, y: 33 }];
    canvasRefs.vectorPaint.isVectorPaintRemoveRef.current = true;

    // before — a real drag that stays inside the already-filled upper-right triangle
    continueVectorPaintDrag(canvas, pointerEvent(80, 20), dispatch, canvasRefs);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);

    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual([]);
    expect(changes.fillColorOverrideByKey).toBeUndefined();
    // the highlight tracks face.key (the render-time walk key), not the loopKey used for filledFaceKeys
    expect(canvasRefs.vectorPaint.vectorPaintTouchedFacesRef.current![nodeId]).toEqual(['diag,s1,s2']);
  });

  it('should not fill an untouched-and-unfilled face while remove mode is armed (a remove stroke only ever destroys fill, never adds it)', () => {
    // mock
    const nodeId = addSplitSquareVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [{ x: 66, y: 33 }];
    canvasRefs.vectorPaint.isVectorPaintRemoveRef.current = true;

    // before — a real drag that stays inside the unfilled lower-left triangle
    continueVectorPaintDrag(canvas, pointerEvent(20, 80), dispatch, canvasRefs);

    // result — nothing to remove there, so no dispatch at all
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not re-dispatch for a face already touched earlier in the same stroke', () => {
    // mock
    const nodeId = addSplitSquareVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [{ x: 66, y: 33 }];

    // before — first move touches the upper-right triangle, second move stays inside it
    continueVectorPaintDrag(canvas, pointerEvent(70, 30), dispatch, canvasRefs);
    continueVectorPaintDrag(canvas, pointerEvent(75, 25), dispatch, canvasRefs);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(canvasRefs.vectorPaint.touchedVectorPaintLoopKeysRef.current[nodeId].size).toBe(1);
  });

  it('should bake a crossing the newly-touched face depends on into a real, persisted vertex while painting live', () => {
    // mock
    const nodeId = addSquareWithVirtualCrossingVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [{ x: 500, y: 500 }];

    // before — drag into the top half of the square, above the virtual crossing line
    continueVectorPaintDrag(canvas, pointerEvent(50, 25), dispatch, canvasRefs);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);

    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toHaveLength(1);
    expect(changes.segments).toBeDefined();
    expect(changes.vertices).toBeDefined();
  });

  it('should skip nodes with no vector editing selection', () => {
    // mock
    addSplitSquareVectorNode();

    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();

    canvasRefs.vectorPaint.vectorPaintPathRef.current = [{ x: 66, y: 33 }];

    // before
    continueVectorPaintDrag(canvas, pointerEvent(70, 30), dispatch, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
