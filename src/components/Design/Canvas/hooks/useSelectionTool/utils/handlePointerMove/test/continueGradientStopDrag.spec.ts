import { RefObject } from 'react';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
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

  it('should not throw when the dragged node no longer exists', () => {
    // mock — the node was deleted since the drag started
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#000000', draggedStopIndex: 1, nodeId: 'gone', opacity: 100, paintIndex: 0 });

    // before / result
    expect(() => continueGradientStopDrag(canvas, pointerEvent(30, 50), store.dispatch, dragRef)).not.toThrow();
  });

  it('should do nothing, and not dispatch, when no stop matches the dragged color/opacity anymore', () => {
    // mock — the stop was deleted (or its color changed) since the drag started
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#123456', draggedStopIndex: 1, nodeId, opacity: 100, paintIndex: 0 });

    // before
    continueGradientStopDrag(canvas, pointerEvent(30, 50), store.dispatch, dragRef);

    // result — the original two stops are untouched
    expect(getStops(nodeId)).toEqual([
      { color: '#ffffff', opacity: 100, position: 0 },
      { color: '#000000', opacity: 100, position: 1 },
    ]);
  });

  it('should fall back to position 0 as the reference when the recorded draggedStopIndex is out of range', () => {
    // mock — two black stops (0.1 and 0.9); index 5 doesn't exist, so the reference position falls
    // back to 0, favoring the one closest to the start of the line (0.1) over the other (0.9)
    const nodeId = addGradientRectangle();

    store.dispatch(
      updateNode({
        changes: {
          fills: [
            {
              end: { x: 1, y: 0.5 },
              opacity: 100,
              start: { x: 0, y: 0.5 },
              stops: [
                { color: '#000000', opacity: 100, position: 0.1 },
                { color: '#ffffff', opacity: 100, position: 0.5 },
                { color: '#000000', opacity: 100, position: 0.9 },
              ],
              type: 'gradient-linear',
            },
          ],
        },
        id: nodeId,
      }),
    );

    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#000000', draggedStopIndex: 5, nodeId, opacity: 100, paintIndex: 0 });

    // before — drag toward x=20 (position 0.2)
    continueGradientStopDrag(canvas, pointerEvent(20, 50), store.dispatch, dragRef);

    // result — the stop that was at 0.1 moved; the one at 0.9 stayed put
    const stops = getStops(nodeId);

    expect(stops.some((stop) => stop.color === '#000000' && stop.position === 0.9)).toBe(true);
    expect(stops.some((stop) => stop.color === '#000000' && Math.abs(stop.position - 0.2) < 1e-9)).toBe(true);
  });

  it('should keep the earlier closest candidate instead of replacing it with a farther later one', () => {
    // mock — two red stops sharing the dragged color/opacity: one already exactly at the reference
    // position, one far away later in the array — the far one must not overwrite the exact match
    const nodeId = addGradientRectangle();
    store.dispatch(
      updateNode({
        changes: {
          fills: [
            {
              end: { x: 1, y: 0.5 },
              opacity: 100,
              start: { x: 0, y: 0.5 },
              stops: [
                { color: '#ff0000', opacity: 100, position: 0.1 },
                { color: '#ffffff', opacity: 100, position: 0.5 },
                { color: '#ff0000', opacity: 100, position: 0.9 },
              ],
              type: 'gradient-linear',
            },
          ],
        },
        id: nodeId,
      }),
    );
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#ff0000', draggedStopIndex: 0, nodeId, opacity: 100, paintIndex: 0 });

    // before — drag toward x=20 (position 0.2); the stop that was at 0.1 should move, not the one at 0.9
    continueGradientStopDrag(canvas, pointerEvent(20, 50), store.dispatch, dragRef);

    // result
    const stops = getStops(nodeId);

    expect(stops.some((stop) => stop.color === '#ff0000' && stop.position === 0.9)).toBe(true);
    expect(stops.some((stop) => stop.color === '#ff0000' && Math.abs(stop.position - 0.2) < 1e-9)).toBe(true);
  });

  it('should rotate the cursor into the node’s local space before measuring an angular gradient stop, for a rotated node', () => {
    // mock — same setup as the unrotated angular test above, but rotated 45°; the unrotated case
    // resolves to position ~0.25 for this exact click, so a different result here proves the cursor
    // was rotated into local space first
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
        rotation: Math.PI / 4,
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

    // before
    continueGradientStopDrag(canvas, pointerEvent(0, 50), store.dispatch, dragRef);

    // result
    const position = getStops(nodeId).find((stop) => stop.color === '#000000')?.position;

    expect(position).toBeDefined();
    expect(position).not.toBeCloseTo(0.25, 5);
  });

  it('should only touch the fill at the dragged paintIndex, leaving earlier fills in the stack untouched', () => {
    // mock — a solid fill stacked below the gradient one being dragged (paintIndex: 1)
    store.dispatch(
      addNode({
        fills: [
          { color: '#ff0000', opacity: 100, type: 'solid' },
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
    const nodeId = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const dragRef = createGradientStopDragRef({ color: '#000000', draggedStopIndex: 1, nodeId, opacity: 100, paintIndex: 1 });

    // before
    continueGradientStopDrag(canvas, pointerEvent(30, 50), store.dispatch, dragRef);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;

    expect(node.fills[0]).toEqual({ color: '#ff0000', opacity: 100, type: 'solid' });

    const gradientFill = node.fills[1];

    expect(
      gradientFill.type === 'gradient-linear' ? gradientFill.stops.find((stop) => stop.color === '#000000')?.position : undefined,
    ).toBeCloseTo(0.3);
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
