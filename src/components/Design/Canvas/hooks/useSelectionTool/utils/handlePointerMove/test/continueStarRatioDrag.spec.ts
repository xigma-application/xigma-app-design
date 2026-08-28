import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TStarNode } from 'types/design/types';
import { TStarRatioDragState } from 'types/design/selectionTool/types';

// utils
import { continueStarRatioDrag } from '../continueStarRatioDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createStarRatioDragRef = (dragState: TStarRatioDragState | null = null): RefObject<TStarRatioDragState | null> => ({
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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueStarRatioDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no star ratio drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueStarRatioDrag(canvas, pointerEvent(10, 10), store.dispatch, createStarRatioDragRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it("should dispatch a ratio proportional to the pointer's distance along the vertex's own anchor axis", () => {
    // mock — center of a 100x100 bounds is (50, 50); the anchor for vertex index 1 of a 5-point star
    // sits at (79.389263, 9.549150); a pointer halfway there yields ratio 0.5
    const idA = addStarNode(0, 0, 100, 100, 5, 0.382);
    const canvas = createCanvas();
    const dragRef = createStarRatioDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      points: 5,
      rotation: 0,
    });

    // before
    continueStarRatioDrag(canvas, pointerEvent(64.694631, 29.774575), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TStarNode).ratio).toBeCloseTo(0.5, 5);
  });

  it('should clamp the ratio to the minimum once the pointer reaches the center', () => {
    // mock
    const idA = addStarNode(0, 0, 100, 100, 5, 0.382);
    const canvas = createCanvas();
    const dragRef = createStarRatioDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      points: 5,
      rotation: 0,
    });

    // before
    continueStarRatioDrag(canvas, pointerEvent(50, 50), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TStarNode).ratio).toBeCloseTo(0.001, 5);
  });

  it('should clamp the ratio to the maximum once the pointer overshoots past the anchor', () => {
    // mock — 1.5x past the anchor along its own axis
    const idA = addStarNode(0, 0, 100, 100, 5, 0.382);
    const canvas = createCanvas();
    const dragRef = createStarRatioDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      points: 5,
      rotation: 0,
    });

    // before
    continueStarRatioDrag(canvas, pointerEvent(94.083894, -10.676275), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TStarNode).ratio).toBe(1);
  });

  it('should un-flip the query point before computing the ratio on a flipped node', () => {
    // mock — the same halfway point from above, mirrored across the center's x axis; flipping it back
    // must reproduce the identical ratio
    const idA = addStarNode(0, 0, 100, 100, 5, 0.382);
    const canvas = createCanvas();
    const dragRef = createStarRatioDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: true,
      flipY: false,
      nodeId: idA,
      points: 5,
      rotation: 0,
    });

    // before
    continueStarRatioDrag(canvas, pointerEvent(35.305369, 29.774575), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TStarNode).ratio).toBeCloseTo(0.5, 5);
  });

  it('should un-rotate the query point before computing the ratio on a rotated node', () => {
    // mock — the same halfway point, rotated 90deg around the center; un-rotating it back must
    // reproduce the identical ratio
    const idA = addStarNode(0, 0, 100, 100, 5, 0.382);
    const canvas = createCanvas();
    const dragRef = createStarRatioDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      nodeId: idA,
      points: 5,
      rotation: 90,
    });

    // before
    continueStarRatioDrag(canvas, pointerEvent(70.225425, 64.694631), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TStarNode).ratio).toBeCloseTo(0.5, 5);
  });
});
