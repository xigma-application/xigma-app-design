import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TStarVertexCountDragState } from '../../../types';
import { TStarNode } from 'types/design/types';

// utils
import { continueStarVertexCountDrag } from '../continueStarVertexCountDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createStarVertexCountDragRef = (dragState: TStarVertexCountDragState | null = null): RefObject<TStarVertexCountDragState | null> => ({
  current: dragState,
});

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

describe('continueStarVertexCountDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no star vertex-count drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueStarVertexCountDrag(canvas, pointerEvent(10, 10), store.dispatch, createStarVertexCountDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should dispatch 4 points for a pointer due east of the center (target angle 0)', () => {
    // mock — center of a 100x100 bounds is (50, 50); a point due east sits on count 4's own target angle
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueStarVertexCountDrag(canvas, pointerEvent(100, 50), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).points).toBe(4);
  });

  it("should dispatch a points count snapped to the nearest candidate's own target angle", () => {
    // mock — a point sitting exactly on count 10's own target angle, 40 world units out from the center
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueStarVertexCountDrag(canvas, pointerEvent(73.51141, 17.63932), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).points).toBe(10);
  });

  it('should dispatch the minimum once the pointer crosses past the vertical axis through the center', () => {
    // mock
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before — x (40) is left of the center (50)
    continueStarVertexCountDrag(canvas, pointerEvent(40, 50), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).points).toBe(3);
  });

  it('should un-flip the query point before computing the count on a flipped node', () => {
    // mock — the same count-10 target angle from above, mirrored across the center's x axis;
    // flipping it back must reproduce the identical count
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: true,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueStarVertexCountDrag(canvas, pointerEvent(26.48859, 17.63932), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).points).toBe(10);
  });

  it('should un-rotate the query point before computing the count on a rotated node', () => {
    // mock — the same count-10 target angle, rotated 90deg around the center; un-rotating it back
    // must reproduce the identical count
    const idA = addStarNode(0, 0, 100, 100, 5, 0.5);
    const canvas = createCanvas();
    const dragRef = createStarVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 90,
    });

    // before
    continueStarVertexCountDrag(canvas, pointerEvent(82.36068, 73.51141), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TStarNode).points).toBe(10);
  });
});
