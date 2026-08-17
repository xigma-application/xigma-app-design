import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonVertexCountDragState } from '../../../types';
import { TPolygonNode } from 'types/design/types';

// utils
import { continuePolygonVertexCountDrag } from '../continuePolygonVertexCountDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createPolygonVertexCountDragRef = (
  dragState: TPolygonVertexCountDragState | null = null,
): RefObject<TPolygonVertexCountDragState | null> => ({ current: dragState });

const addPolygonNode = (x: number, y: number, width: number, height: number, sides: number): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height,
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides,
      type: NodeType.polygon,
      width,
      x,
      y,
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continuePolygonVertexCountDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no polygon vertex-count drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continuePolygonVertexCountDrag(canvas, pointerEvent(10, 10), store.dispatch, createPolygonVertexCountDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should dispatch 4 sides for a pointer due east of the center (target angle 0)', () => {
    // mock — center of a 100x100 bounds is (50, 50); a point due east sits on count 4's own target angle
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continuePolygonVertexCountDrag(canvas, pointerEvent(100, 50), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).sides).toBe(4);
  });

  it("should dispatch a sides count snapped to the nearest candidate's own target angle", () => {
    // mock — a point sitting exactly on count 10's own target angle, 40 world units out from the center
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continuePolygonVertexCountDrag(canvas, pointerEvent(73.51141, 17.63932), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).sides).toBe(10);
  });

  it('should dispatch the minimum once the pointer crosses past the vertical axis through the center', () => {
    // mock
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before — x (40) is left of the center (50)
    continuePolygonVertexCountDrag(canvas, pointerEvent(40, 50), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).sides).toBe(3);
  });

  it('should un-flip the query point before computing the count on a flipped node', () => {
    // mock — the same count-10 target angle from above, mirrored across the center's x axis;
    // flipping it back must reproduce the identical count
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: true,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continuePolygonVertexCountDrag(canvas, pointerEvent(26.48859, 17.63932), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).sides).toBe(10);
  });

  it('should un-rotate the query point before computing the count on a rotated node', () => {
    // mock — the same count-10 target angle, rotated 90deg around the center; un-rotating it back
    // must reproduce the identical count
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonVertexCountDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 90,
    });

    // before
    continuePolygonVertexCountDrag(canvas, pointerEvent(82.36068, 73.51141), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).sides).toBe(10);
  });
});
