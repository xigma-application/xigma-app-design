// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { continueVectorWidthPointDrag } from '../continueVectorWidthPointDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const addLineVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorWidthPointDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should do nothing when no width-point drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    // before
    continueVectorWidthPointDrag(canvas, pointerEvent(10, 10), canvasRefs, setClassName);

    // result
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should grow both offsets from zero as the pointer drags away from a freshly-armed point at the base seed', () => {
    // mock — segment a(0,0)->b(100,0), width point pinned at its midpoint (50,0), armed right on the line (0 seed)
    const nodeId = addLineVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 50, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId,
      point: { id: 'p1', leftOffset: 0, position: 0.5, rightOffset: 0 },
      target: 'right',
    };

    // before — pointer moves 10px perpendicular to the path
    continueVectorWidthPointDrag(canvas, pointerEvent(50, 10), canvasRefs, setClassName);

    // result
    const drag = canvasRefs.vectorWidth.vectorWidthPointDragRef.current;

    expect(drag).not.toBeNull();
    expect(drag?.point.leftOffset).toBeCloseTo(10, 5);
    expect(drag?.point.rightOffset).toBeCloseTo(10, 5);
    // resizing a handle uses the rotated resize cursor, not the plain controller class
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should sync every group target to the same computed offset as the actively-dragged regulator', () => {
    // mock — a multi-selected group resize: dragging p1's handle should also update p2 and p3 to match
    const nodeId = addLineVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();
    const groupTargets = [
      { nodeId, point: { id: 'p2', leftOffset: 3, position: 0.2, rightOffset: 3 } },
      { nodeId, point: { id: 'p3', leftOffset: 7, position: 0.8, rightOffset: 7 } },
    ];

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 50, y: 0 },
      groupTargets,
      isNewPoint: true,
      nodeId,
      point: { id: 'p1', leftOffset: 0, position: 0.5, rightOffset: 0 },
      target: 'right',
    };

    // before — pointer moves 10px perpendicular to the path
    continueVectorWidthPointDrag(canvas, pointerEvent(50, 10), canvasRefs, setClassName);

    // result — both group targets now match the primary point's freshly computed offset, not their own seed
    expect(groupTargets[0].point.leftOffset).toBeCloseTo(10, 5);
    expect(groupTargets[0].point.rightOffset).toBeCloseTo(10, 5);
    expect(groupTargets[1].point.leftOffset).toBeCloseTo(10, 5);
    expect(groupTargets[1].point.rightOffset).toBeCloseTo(10, 5);
  });

  it('should not jump when a new point is seeded with a large interpolated width from a nearby point', () => {
    // mock — a new point armed with a 35px seed (e.g. interpolated near an existing wide point), clicked right on the centerline
    const nodeId = addLineVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 35,
      armWorldPoint: { x: 50, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId,
      point: { id: 'p1', leftOffset: 35, position: 0.5, rightOffset: 35 },
      target: 'right',
    };

    // before — the pointer hasn't moved at all yet from the arm position
    continueVectorWidthPointDrag(canvas, pointerEvent(50, 0), canvasRefs, setClassName);

    // result — no jump: the offset stays exactly at the seeded 35px, not snapping to the raw click-to-anchor distance
    let drag = canvasRefs.vectorWidth.vectorWidthPointDragRef.current;

    expect(drag?.point.leftOffset).toBeCloseTo(35, 5);
    expect(drag?.point.rightOffset).toBeCloseTo(35, 5);

    // action — a small 1px move should adjust the seed by exactly that much, not replace it
    continueVectorWidthPointDrag(canvas, pointerEvent(50, 1), canvasRefs, setClassName);
    drag = canvasRefs.vectorWidth.vectorWidthPointDragRef.current;

    expect(drag?.point.leftOffset).toBeCloseTo(36, 5);
    expect(drag?.point.rightOffset).toBeCloseTo(36, 5);
  });

  it('should move both offsets together, symmetrically, when dragging the left handle of an existing point', () => {
    // mock — segment a(0,0)->b(100,0), point pinned at midpoint (50,0) with existing offsets, armed right at the left handle (50,2)
    const nodeId = addLineVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 2,
      armWorldPoint: { x: 50, y: 2 },
      groupTargets: [],
      isNewPoint: false,
      nodeId,
      point: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 },
      target: 'left',
    };

    // before — pointer moves 12px to the "left" side (+normal, i.e. positive y for this horizontal segment)
    continueVectorWidthPointDrag(canvas, pointerEvent(50, 12), canvasRefs, setClassName);

    // result — the opposite (right) side follows the same value, not just the dragged side
    const drag = canvasRefs.vectorWidth.vectorWidthPointDragRef.current;

    expect(drag).not.toBeNull();
    expect(drag?.point.leftOffset).toBeCloseTo(12, 5);
    expect(drag?.point.rightOffset).toBeCloseTo(12, 5);
  });

  it('should move both offsets together, symmetrically, when dragging the right handle of an existing point', () => {
    // mock — armed right at the right handle (50,-2)
    const nodeId = addLineVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 2,
      armWorldPoint: { x: 50, y: -2 },
      groupTargets: [],
      isNewPoint: false,
      nodeId,
      point: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 },
      target: 'right',
    };

    // before — pointer moves 15px to the "right" side (-normal, i.e. negative y for this horizontal segment)
    continueVectorWidthPointDrag(canvas, pointerEvent(50, -15), canvasRefs, setClassName);

    // result — the opposite (left) side follows the same value, not just the dragged side
    const drag = canvasRefs.vectorWidth.vectorWidthPointDragRef.current;

    expect(drag).not.toBeNull();
    expect(drag?.point.leftOffset).toBeCloseTo(15, 5);
    expect(drag?.point.rightOffset).toBeCloseTo(15, 5);
  });

  it('should clamp both offsets to zero rather than going negative when dragged past the path', () => {
    // mock
    const nodeId = addLineVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 2,
      armWorldPoint: { x: 50, y: 2 },
      groupTargets: [],
      isNewPoint: false,
      nodeId,
      point: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 },
      target: 'left',
    };

    // before — pointer crosses past the path to the opposite ("right") side while dragging the "left" handle
    continueVectorWidthPointDrag(canvas, pointerEvent(50, -12), canvasRefs, setClassName);

    // result
    const drag = canvasRefs.vectorWidth.vectorWidthPointDragRef.current;

    expect(drag?.point.leftOffset).toBe(0);
    expect(drag?.point.rightOffset).toBe(0);
  });

  it('should reposition an existing point along the path, as a fraction of total chain length, leaving its offsets untouched, when its target is "point"', () => {
    // mock — segment a(0,0)->b(100,0), point starts at its midpoint (50,0)
    const nodeId = addLineVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId,
      point: { id: 'p1', leftOffset: 3, position: 0.5, rightOffset: 3 },
      target: 'point',
    };

    // before — pointer slides further along the same straight path, right on the line
    continueVectorWidthPointDrag(canvas, pointerEvent(80, 0), canvasRefs, setClassName);

    // result — a straight single-segment chain, so position (fraction of total length) equals t exactly
    const drag = canvasRefs.vectorWidth.vectorWidthPointDragRef.current;

    expect(drag).not.toBeNull();
    expect(drag?.point.position).toBeCloseTo(0.8, 2);
    expect(drag?.point.leftOffset).toBe(3);
    expect(drag?.point.rightOffset).toBe(3);
    // repositioning along the path keeps the plain controller cursor, not a rotated resize cursor
    expect(canvas.style.cursor).toBe('');
    expect(setClassName).toHaveBeenCalledWith('controller');
  });

  it('should leave the dragged point untouched, but still set the cursor, if its node no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();
    const point = { id: 'p1', leftOffset: 3, position: 0.5, rightOffset: 3 };

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: true,
      nodeId: 'missing-node',
      point,
      target: 'right',
    };

    // before
    continueVectorWidthPointDrag(canvas, pointerEvent(50, 10), canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current?.point).toEqual(point);
    expect(setClassName).toHaveBeenCalledWith('controller');
  });

  it('should leave the dragged point untouched, but still set the cursor, if its node no longer has a valid chain', () => {
    // mock — a vector node with no segments at all has no chain to resolve against
    store.dispatch(
      addNode({
        fillColor: null,
        filledFaceKeys: [],
        name: 'Vector',
        parentId: null,
        rotation: 0,
        segments: {},
        strokeColor: '#000000',
        strokeWidth: 4,
        type: NodeType.vector,
        vertexHandleModes: {},
        vertices: {},
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const setClassName = vi.fn();
    const point = { id: 'p1', leftOffset: 3, position: 0.5, rightOffset: 3 };

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: 0,
      armWorldPoint: { x: 0, y: 0 },
      groupTargets: [],
      isNewPoint: false,
      nodeId,
      point,
      target: 'point',
    };

    // before
    continueVectorWidthPointDrag(canvas, pointerEvent(80, 0), canvasRefs, setClassName);

    // result
    expect(canvasRefs.vectorWidth.vectorWidthPointDragRef.current?.point).toEqual(point);
    expect(setClassName).toHaveBeenCalledWith('controller');
  });
});
