import { RefObject } from 'react';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TGradientRotateDragState } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TRectangleNode } from 'types/design/types';

// utils
import { continueGradientRotateDrag } from '../continueGradientRotateDrag';
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createGradientRotateDragRef = (
  dragState: TGradientRotateDragState | null = null,
): RefObject<TGradientRotateDragState | null> => ({ current: dragState });

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

const getGradientPoints = (nodeId: string): { end: TPoint; start: TPoint } | null => {
  const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TRectangleNode;
  const paint = node.fills[0];

  return paint.type === 'gradient-linear' ? { end: paint.end, start: paint.start } : null;
};

const expectPointCloseTo = (point: TPoint, expected: TPoint): void => {
  expect(point.x).toBeCloseTo(expected.x, 5);
  expect(point.y).toBeCloseTo(expected.y, 5);
};

describe('continueGradientRotateDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no gradient rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueGradientRotateDrag(canvas, pointerEvent(30, 50), store.dispatch, createGradientRotateDragRef(), createCanvasRefs());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should rotate both points so the dragged start endpoint follows the pointer, in "box" mode', () => {
    // mock — square bounds (0,0)-(100,100), center (50,50); pointer at world (100,0) is the top-right
    // corner, 45deg off any axis so it never snaps
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({
      angleOffset: 0,
      draggedEndpoint: 'start',
      mode: 'box',
      nodeId,
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 0, y: 0 },
      radius: 50,
    });

    // before
    continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef, createCanvasRefs());

    // result
    const points = getGradientPoints(nodeId);

    expectPointCloseTo(points!.start, { x: 1, y: 0 });
    expectPointCloseTo(points!.end, { x: 0, y: 1 });
  });

  it('should not jump the other endpoint in "box" mode when the original line does not pass through the box center', () => {
    // mock — a real reported regression: a corner-to-corner line along the bottom edge (0,100)-(100,100)
    // does NOT pass through the square's center (50,50); the box-center pivot must not force it there
    const nodeId = addGradientRectangle();

    store.dispatch(
      updateNode({
        changes: { fills: [{ end: { x: 1, y: 1 }, opacity: 100, start: { x: 0, y: 1 }, stops: [], type: 'gradient-linear' }] },
        id: nodeId,
      }),
    );

    const canvas = createCanvas();
    // frozen at arm-time: end's own angle (45deg from center) vs. what pure antipodal symmetry from
    // start's angle (135deg) would predict (135-180=-45deg) — the -90deg gap between them
    const angleOffset = -Math.PI / 2;
    const dragRef = createGradientRotateDragRef({
      angleOffset,
      draggedEndpoint: 'end',
      mode: 'box',
      nodeId,
      paintIndex: 0,
      pivot: { x: 50, y: 100 },
      pointerPosition: { x: 100, y: 100 },
      radius: 50,
    });

    // before — a gentle nudge, barely off the end endpoint's own starting position (100,100)
    continueGradientRotateDrag(canvas, pointerEvent(99, 99), store.dispatch, dragRef, createCanvasRefs());

    // result — both endpoints stay close to their original corners; a box-center-symmetric model
    // would instead have snapped the untouched start endpoint far away from (0,100)
    const points = getGradientPoints(nodeId);
    const worldEnd = { x: points!.end.x * 100, y: points!.end.y * 100 };
    const worldStart = { x: points!.start.x * 100, y: points!.start.y * 100 };

    expect(worldEnd.x).toBeGreaterThan(90);
    expect(worldEnd.y).toBeGreaterThan(90);
    expect(worldStart.x).toBeLessThan(10);
    expect(worldStart.y).toBeGreaterThan(90);
  });

  it('should keep the un-dragged end fixed at the opposite side when dragging the end endpoint toward the same pointer position', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({
      angleOffset: 0,
      draggedEndpoint: 'end',
      mode: 'box',
      nodeId,
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 0, y: 0 },
      radius: 50,
    });

    // before
    continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef, createCanvasRefs());

    // result — the dragged endpoint (end) follows the pointer this time, so start/end are swapped vs. the 'start' case
    const points = getGradientPoints(nodeId);

    expectPointCloseTo(points!.end, { x: 1, y: 0 });
    expectPointCloseTo(points!.start, { x: 0, y: 1 });
  });

  it('should rotate around the line\'s own frozen midpoint, at its own frozen radius, in "line" mode', () => {
    // mock — pivot away from the box center, radius shorter than the box's own half-diagonal;
    // dragging toward world (70,30) (45deg off axis from the pivot) should place the dragged start
    // there at exactly the frozen radius, not on the box edge
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const pivot = { x: 40, y: 40 };
    const radius = 20;
    const dragRef = createGradientRotateDragRef({
      angleOffset: 0,
      draggedEndpoint: 'start',
      mode: 'line',
      nodeId,
      paintIndex: 0,
      pivot,
      pointerPosition: { x: 0, y: 0 },
      radius,
    });

    // before
    continueGradientRotateDrag(canvas, pointerEvent(70, 30), store.dispatch, dragRef, createCanvasRefs());

    // result
    const points = getGradientPoints(nodeId);
    const worldStart = { x: points!.start.x * 100, y: points!.start.y * 100 };
    const worldEnd = { x: points!.end.x * 100, y: points!.end.y * 100 };

    expect(Math.hypot(worldStart.x - pivot.x, worldStart.y - pivot.y)).toBeCloseTo(radius, 5);
    expect(Math.hypot(worldEnd.x - pivot.x, worldEnd.y - pivot.y)).toBeCloseTo(radius, 5);
    expect(worldStart.x).toBeGreaterThan(pivot.x);
    expect(worldEnd.x).toBeLessThan(pivot.x);
  });

  it('should update the drag state pointer position for the following angle label', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({
      angleOffset: 0,
      draggedEndpoint: 'start',
      mode: 'box',
      nodeId,
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 0, y: 0 },
      radius: 50,
    });

    // before
    continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef, createCanvasRefs());

    // result
    expectPointCloseTo(dragRef.current!.pointerPosition, { x: 100, y: 0 });
  });

  it('should snap the angle to horizontal and set the alignment guide when close to it', () => {
    // mock — pointer just 1deg off a perfectly horizontal angle from the box center, within the 3deg
    // snap tolerance
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({
      angleOffset: 0,
      draggedEndpoint: 'start',
      mode: 'box',
      nodeId,
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 0, y: 0 },
      radius: 50,
    });
    const canvasRefs = createCanvasRefs();
    const angleRadians = (1 * Math.PI) / 180;
    const target = { x: 50 + 1000 * Math.cos(angleRadians), y: 50 + 1000 * Math.sin(angleRadians) };

    // before
    continueGradientRotateDrag(canvas, pointerEvent(target.x, target.y), store.dispatch, dragRef, canvasRefs);

    // result — snapped exactly onto the horizontal, y stays 0.5 for both points
    const points = getGradientPoints(nodeId);

    expect(points!.start.y).toBeCloseTo(0.5, 5);
    expect(points!.end.y).toBeCloseTo(0.5, 5);
    expect(canvasRefs.transform.alignmentGuideRef.current).not.toBeNull();
    expect(canvasRefs.transform.alignmentGuideRef.current?.horizontal).not.toBeNull();
    expect(canvasRefs.transform.alignmentGuideRef.current?.vertical).toBeNull();
  });

  it('should clear the alignment guide once the angle moves away from any axis', () => {
    const nodeId = addGradientRectangle();
    const canvas = createCanvas();
    const dragRef = createGradientRotateDragRef({
      angleOffset: 0,
      draggedEndpoint: 'start',
      mode: 'box',
      nodeId,
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 0, y: 0 },
      radius: 50,
    });
    const canvasRefs = createCanvasRefs();

    // before — 45deg off axis, well outside the snap tolerance
    continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef, canvasRefs);

    // result
    expect(canvasRefs.transform.alignmentGuideRef.current).toBeNull();
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
    const dragRef = createGradientRotateDragRef({
      angleOffset: 0,
      draggedEndpoint: 'start',
      mode: 'box',
      nodeId,
      paintIndex: 0,
      pivot: { x: 50, y: 50 },
      pointerPosition: { x: 0, y: 0 },
      radius: 50,
    });

    // before / result — no crash, and the solid fill is left untouched
    expect(() =>
      continueGradientRotateDrag(canvas, pointerEvent(100, 0), store.dispatch, dragRef, createCanvasRefs()),
    ).not.toThrow();
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId]).toMatchObject({
      fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
    });
  });
});
