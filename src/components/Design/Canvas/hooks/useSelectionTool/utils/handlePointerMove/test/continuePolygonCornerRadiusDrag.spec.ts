import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPolygonCornerRadiusDragState } from 'types/design/canvas/types';
import { TPolygonNode } from 'types/design/types';

// utils
import { continuePolygonCornerRadiusDrag } from '../continuePolygonCornerRadiusDrag';
import { getMaxPolygonCornerRadius } from 'utils/canvas/cornerRadius/polygon/getMaxPolygonCornerRadius';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createPolygonCornerRadiusDragRef = (
  dragState: TPolygonCornerRadiusDragState | null = null,
): RefObject<TPolygonCornerRadiusDragState | null> => ({ current: dragState });

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

describe('continuePolygonCornerRadiusDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no polygon corner-radius drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continuePolygonCornerRadiusDrag(canvas, pointerEvent(10, 10), store.dispatch, createPolygonCornerRadiusDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should dispatch a rounded cornerRadius derived from the projected pointer position, converted through the setback multiplier', () => {
    // mock — top vertex of a 100x100 triangle sits at (50, 0); a 20 setback / the tip's multiplier of 2 gives radius 10
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: false,
      nodeId: idA,
      rotation: 0,
      sides: 3,
    });

    // before
    continuePolygonCornerRadiusDrag(canvas, pointerEvent(50, 20), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).cornerRadius).toBe(10);
  });

  it('should clamp the dispatched radius to the polygon max instead of overshooting toward the center', () => {
    // mock
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: false,
      nodeId: idA,
      rotation: 0,
      sides: 3,
    });
    const maxRadius = getMaxPolygonCornerRadius({ height: 100, width: 100, x: 0, y: 0 }, 3);

    // before — dragged well past the center
    continuePolygonCornerRadiusDrag(canvas, pointerEvent(50, 100), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).cornerRadius).toBe(Math.round(maxRadius));
  });

  it('should clamp a negative projection (pointer dragged away from center) to 0', () => {
    // mock
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: false,
      nodeId: idA,
      rotation: 0,
      sides: 3,
    });

    // before — dragged above the top vertex, away from the center
    continuePolygonCornerRadiusDrag(canvas, pointerEvent(50, -20), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).cornerRadius).toBe(0);
  });

  it('should un-rotate the query point before computing the radius on a rotated node', () => {
    // mock — a 100x100 triangle rotated 90deg around its center (50, 50); the top vertex (50, 0)
    const idA = addPolygonNode(0, 0, 100, 100, 3);
    const canvas = createCanvas();
    const dragRef = createPolygonCornerRadiusDragRef({
      bounds: { height: 100, width: 100, x: 0, y: 0 },
      flipX: false,
      flipY: false,
      hasMoved: false,
      nodeId: idA,
      rotation: 90,
      sides: 3,
    });

    // before — the physical world point at the rotated top vertex itself should resolve to radius 0
    continuePolygonCornerRadiusDrag(canvas, pointerEvent(100, 50), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TPolygonNode).cornerRadius).toBe(0);
  });
});
