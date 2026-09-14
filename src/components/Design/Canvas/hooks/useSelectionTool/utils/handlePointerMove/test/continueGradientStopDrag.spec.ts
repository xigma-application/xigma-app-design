import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGradientStopDragState } from 'types/design/canvas/types';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueGradientStopDrag } from '../continueGradientStopDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createGradientStopDragRef = (dragState: TGradientStopDragState | null = null): RefObject<TGradientStopDragState | null> => ({
  current: dragState,
});

const addGradientRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [
        {
          end: { x: 1, y: 0.5 },
          opacity: 100,
          start: { x: 0, y: 0.5 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0 },
            { color: '#000000', opacity: 100, position: 1 },
          ],
          type: 'gradient-linear',
        },
      ],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const getStops = (nodeId: string): { color: string; opacity: number; position: number }[] => {
  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;
  const paint = node.fills[0];

  return paint.type === 'gradient-linear' || paint.type === 'gradient-angular' ? paint.stops : [];
};

const addAngularGradientRectangle = (): string => {
  store.dispatch(
    addNode({
      fills: [
        {
          end: { x: 0.5, y: 1 },
          opacity: 100,
          start: { x: 0.5, y: 0.5 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0 },
            { color: '#000000', opacity: 100, position: 1 },
          ],
          type: 'gradient-angular',
        },
      ],
      height: 100,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 100,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueGradientStopDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no gradient stop drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueGradientStopDrag(canvas, pointerEvent(30, 50), store.dispatch, createGradientStopDragRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should move the dragged stop to the projected position along the gradient line', () => {
    // mock — gradient line goes from world (0,50) to (100,50); dragging the black stop to x=30
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#000000', draggedStopIndex: 1, nodeId, opacity: 100, paintIndex: 0 });

    // before
    continueGradientStopDrag(canvas, pointerEvent(30, 50), store.dispatch, dragRef);

    // result
    const stops = getStops(nodeId);

    expect(stops).toHaveLength(2);
    expect(stops.find((stop) => stop.color === '#000000')?.position).toBeCloseTo(0.3);
    expect(stops.find((stop) => stop.color === '#ffffff')?.position).toBe(0);
  });

  it('should re-sort the stops array when the dragged stop crosses another, and track it by its own identity', () => {
    // mock — dragging the black stop (starts at position 1) past the white stop (fixed at 0) to x=-10 (clamped to 0)
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#000000', draggedStopIndex: 1, nodeId, opacity: 100, paintIndex: 0 });

    // before
    continueGradientStopDrag(canvas, pointerEvent(-10, 50), store.dispatch, dragRef);

    // result — both stops now sit at position 0; the black one (the dragged one) must be tracked correctly
    const stops = getStops(nodeId);

    expect(stops.every((stop) => stop.position === 0)).toBe(true);
    expect(dragRef.current?.draggedStopIndex).toBeDefined();
    expect(stops[dragRef.current!.draggedStopIndex].color).toBe('#000000');
  });

  it('should clamp the position within the 0..1 range', () => {
    // mock — pointer far past the end of the line
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#000000', draggedStopIndex: 1, nodeId, opacity: 100, paintIndex: 0 });

    // before
    continueGradientStopDrag(canvas, pointerEvent(500, 50), store.dispatch, dragRef);

    // result
    expect(getStops(nodeId).find((stop) => stop.color === '#000000')?.position).toBe(1);
  });

  it('should move an angular gradient stop by angle around the ellipse, not by linear projection', () => {
    // mock — center (50,50), primary axis endpoint (50,100); dragging to world (0,50), the perpendicular
    // radius-handle point, lands at angle 0.25 — a linear-projection formula would instead clamp this to 0
    const nodeId = addAngularGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#000000', draggedStopIndex: 1, nodeId, opacity: 100, paintIndex: 0 });

    // before
    continueGradientStopDrag(canvas, pointerEvent(0, 50), store.dispatch, dragRef);

    // result
    expect(getStops(nodeId).find((stop) => stop.color === '#000000')?.position).toBeCloseTo(0.25, 5);
  });

  it('should do nothing when the targeted paint is no longer a linear gradient', () => {
    // mock — the fill was switched to solid since the drag started
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 100,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 100,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#000000', draggedStopIndex: 1, nodeId, opacity: 100, paintIndex: 0 });

    // before / result — no crash, and the solid fill is left untouched
    expect(() => continueGradientStopDrag(canvas, pointerEvent(30, 50), store.dispatch, dragRef)).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });
});
