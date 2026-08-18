import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TStarCornerRadiusDragState } from 'types/design/canvas/types';
import { TStarNode } from 'types/design/types';

// utils
import { continueStarCornerRadiusDrag } from '../continueStarCornerRadiusDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createStarCornerRadiusDragRef = (
  dragState: TStarCornerRadiusDragState | null = null,
): RefObject<TStarCornerRadiusDragState | null> => ({ current: dragState });

const addStarNode = (x: number, y: number, width: number, height: number, points: number, ratio: number): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height,
      name: 'Star',
      parentId: null,
      points,
      ratio,
      rotation: 0,
      type: NodeType.star,
      width,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueStarCornerRadiusDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no star corner-radius drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueStarCornerRadiusDrag(canvas, pointerEvent(10, 10), store.dispatch, createStarCornerRadiusDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should dispatch a rounded cornerRadius derived from the projected pointer position, converted through the setback multiplier', () => {
    // mock — top vertex of a 100x100 5-point star sits at (50, 0); moving 10 straight down projects
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: false,
      nodeId: idA,
      points: 5,
      ratio: 0.5,
      rotation: 0,
    });

    // before
    continueStarCornerRadiusDrag(canvas, pointerEvent(50, 10), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).cornerRadius).toBe(4);
  });

  it('should clamp the dispatched radius to the star max instead of overshooting toward the center', () => {
    // mock — max radius for a 100x100/5-point/ratio-0.5 star is ~13.01
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: false,
      nodeId: idA,
      points: 5,
      ratio: 0.5,
      rotation: 0,
    });

    // before — dragged well past the center
    continueStarCornerRadiusDrag(canvas, pointerEvent(50, 100), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).cornerRadius).toBe(13);
  });

  it('should clamp a negative projection (pointer dragged away from center) to 0', () => {
    // mock
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: false,
      nodeId: idA,
      points: 5,
      ratio: 0.5,
      rotation: 0,
    });

    // before — dragged above the top vertex, away from the center
    continueStarCornerRadiusDrag(canvas, pointerEvent(50, -10), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).cornerRadius).toBe(0);
  });

  it('should un-rotate the query point before computing the radius on a rotated node', () => {
    // mock — a 100x100 star rotated 90deg around its center (50, 50); the top vertex (50, 0)
    // swings to world (100, 50)
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: false,
      nodeId: idA,
      points: 5,
      ratio: 0.5,
      rotation: 90,
    });

    // before — the physical world point at the rotated top vertex itself should resolve to radius 0
    continueStarCornerRadiusDrag(canvas, pointerEvent(100, 50), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).cornerRadius).toBe(0);
  });
});
