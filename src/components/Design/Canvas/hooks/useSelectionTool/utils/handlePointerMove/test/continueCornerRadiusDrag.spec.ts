import { RefObject } from 'react';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueCornerRadiusDrag } from '../continueCornerRadiusDrag';
import { TCornerRadiusDragState } from 'types/design/canvas/types';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createCornerRadiusDragRef = (
  cornerRadiusDragState: TCornerRadiusDragState | null = null,
): RefObject<TCornerRadiusDragState | null> => ({
  current: cornerRadiusDragState,
});

const addRectangleNode = (x: number, y: number, width: number, height: number): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width, x, y }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueCornerRadiusDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no corner-radius drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueCornerRadiusDrag(canvas, pointerEvent(10, 10), store.dispatch, createCornerRadiusDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should dispatch a rounded cornerRadius derived from the pointer position on every move', () => {
    // mock
    const idA = addRectangleNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef({
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      candidates: ['ne'],
      corner: 'ne',
      hasMoved: false,
      nodeId: idA,
      pointerStart: { x: 100, y: 0 },
      rotation: 0,
    });

    // before — 20 leftward vs 10 downward from the ne corner, larger axis wins
    continueCornerRadiusDrag(canvas, pointerEvent(80, 10), store.dispatch, cornerRadiusDragRef);

    // result
    expect((store.getState().design.nodes[idA] as TRectangleNode).cornerRadius).toBe(20);
  });

  it('should clamp the dispatched radius to half the smaller dimension', () => {
    // mock
    const idA = addRectangleNode(0, 0, 100, 50);
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef({
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      candidates: ['ne'],
      corner: 'ne',
      hasMoved: false,
      nodeId: idA,
      pointerStart: { x: 100, y: 0 },
      rotation: 0,
    });

    // before
    continueCornerRadiusDrag(canvas, pointerEvent(0, 0), store.dispatch, cornerRadiusDragRef);

    // result
    expect((store.getState().design.nodes[idA] as TRectangleNode).cornerRadius).toBe(25);
  });

  it('should land exactly on a fractional max radius instead of a rounding-overshot integer', () => {
    // mock — height 101 gives a max radius of 50.5; the raw computed radius clamps there before
    // rounding, but Math.round(50.5) alone would push it to 51 without the post-round re-clamp
    const idA = addRectangleNode(0, 0, 200, 101);
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef({
      bounds: { height: 101, width: 200, x: 0, y: 0 },
      candidates: ['ne'],
      corner: 'ne',
      hasMoved: false,
      nodeId: idA,
      pointerStart: { x: 200, y: 0 },
      rotation: 0,
    });

    // before — dragged well past the corner, deep into clamp territory
    continueCornerRadiusDrag(canvas, pointerEvent(0, 101), store.dispatch, cornerRadiusDragRef);

    // result
    expect((store.getState().design.nodes[idA] as TRectangleNode).cornerRadius).toBe(50.5);
  });

  it('should un-rotate the query point before computing the radius on a rotated node', () => {
    // mock — a 100x50 rect rotated 90deg around its center (50, 25); the ne corner (100, 0) swings
    // to world (75, 75)
    const idA = addRectangleNode(0, 0, 100, 50);

    store.dispatch(updateNode({ changes: { rotation: 90 }, id: idA }));

    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef({
      bounds: { height: 50, width: 100, x: 0, y: 0 },
      candidates: ['ne'],
      corner: 'ne',
      hasMoved: false,
      nodeId: idA,
      pointerStart: { x: 75, y: 75 },
      rotation: 90,
    });

    // before — the physical world point at the rotated ne corner itself should resolve to radius 0
    continueCornerRadiusDrag(canvas, pointerEvent(75, 75), store.dispatch, cornerRadiusDragRef);

    // result
    expect((store.getState().design.nodes[idA] as TRectangleNode).cornerRadius).toBe(0);
  });

  it('should leave the corner unresolved and dispatch nothing while the pointer has not moved yet', () => {
    // mock — a square at max radius, all 4 handles coincide at the center (50, 50)
    const idA = addRectangleNode(0, 0, 100, 100);
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      candidates: ['ne', 'nw', 'se', 'sw'],
      corner: null,
      hasMoved: false,
      nodeId: idA,
      pointerStart: { x: 50, y: 50 },
      rotation: 0,
    });

    // before — pointermove reporting the exact same point as pointerStart (no real movement)
    continueCornerRadiusDrag(canvas, pointerEvent(50, 50), store.dispatch, cornerRadiusDragRef);

    // result
    expect(cornerRadiusDragRef.current?.corner).toBeNull();
    expect(store.getState().design.nodes[idA]).not.toHaveProperty('cornerRadius');
  });

  it('should resolve the corner from the first real movement direction, then keep using it for later moves', () => {
    // mock — a square at max radius, all 4 handles coincide at the center (50, 50)
    const idA = addRectangleNode(0, 0, 100, 100);
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      candidates: ['ne', 'nw', 'se', 'sw'],
      corner: null,
      hasMoved: false,
      nodeId: idA,
      pointerStart: { x: 50, y: 50 },
      rotation: 0,
    });

    // before — moving down+right from the center points into the "se" quadrant
    continueCornerRadiusDrag(canvas, pointerEvent(55, 55), store.dispatch, cornerRadiusDragRef);

    // result — resolved to "se"; radius is the absolute inset from the se corner (55, 55)
    expect(cornerRadiusDragRef.current?.corner).toBe('se');
    expect((store.getState().design.nodes[idA] as TRectangleNode).cornerRadius).toBe(45);

    // action — a later move further along the same quadrant still applies "se" logic, not re-resolved
    continueCornerRadiusDrag(canvas, pointerEvent(40, 40), store.dispatch, cornerRadiusDragRef);

    // result
    expect(cornerRadiusDragRef.current?.corner).toBe('se');
    expect((store.getState().design.nodes[idA] as TRectangleNode).cornerRadius).toBe(50);
  });

  it('should resolve to whichever pair candidate best matches the movement when only 2 handles coincide', () => {
    // mock — a wide rectangle's max radius (25) is half its height, so nw/sw coincide together at
    // (25, 25) on the left side (ne/se coincide separately on the right)
    const idA = addRectangleNode(0, 0, 200, 50);
    const canvas = createCanvas();
    const cornerRadiusDragRef = createCornerRadiusDragRef({
      bounds: { height: 50, width: 200, x: 0, y: 0 },
      candidates: ['nw', 'sw'],
      corner: null,
      hasMoved: false,
      nodeId: idA,
      pointerStart: { x: 25, y: 25 },
      rotation: 0,
    });

    // before — moving purely up points toward "nw", which sits above the collision point
    continueCornerRadiusDrag(canvas, pointerEvent(25, 15), store.dispatch, cornerRadiusDragRef);

    // result
    expect(cornerRadiusDragRef.current?.corner).toBe('nw');
  });
});
