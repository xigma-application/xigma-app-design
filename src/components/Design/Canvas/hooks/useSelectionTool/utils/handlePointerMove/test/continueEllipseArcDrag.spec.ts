import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseArcDragState } from 'types/design/canvas/types';
import { TEllipseNode } from 'types/design/types';

// utils
import { continueEllipseArcDrag } from '../continueEllipseArcDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createEllipseArcDragRef = (dragState: TEllipseArcDragState | null = null): RefObject<TEllipseArcDragState | null> => ({
  current: dragState,
});

const addEllipseNode = (overrides: Partial<TEllipseNode> = {}): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 100,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 100,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('continueEllipseArcDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no ellipse-arc drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueEllipseArcDrag(canvas, pointerEvent(10, 10), store.dispatch, createEllipseArcDragRef());

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it("should dispatch a new arcEndAngle from the pointer's compass angle relative to center", () => {
    // mock — arcStartAngle/arcEndAngle default to 90°; dragging to the north rim targets compass 0°
    const idA = addEllipseNode();
    const canvas = createCanvas();
    const dragRef = createEllipseArcDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcDrag(canvas, pointerEvent(50, 0), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TEllipseNode).arcEndAngle).toBe(0);
  });

  it('should snap the sweep to the nearest full-lap multiple once it lands within the snap threshold', () => {
    // mock — arcStartAngle 0, arcEndAngle already near a lap (2°); dragging to compass 358° lands
    // the unsnapped sweep 2° short of a full 360° lap, inside the 3° snap threshold
    const idA = addEllipseNode({ arcEndAngle: 2, arcStartAngle: 0 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcDrag(canvas, pointerEvent(48.255025, 0.030459), store.dispatch, dragRef);

    // result — snapped exactly onto the lap: arcStartAngle (0) + nearestLapSweep (0)
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TEllipseNode).arcEndAngle).toBe(0);
  });

  it('should not divide by zero when arcRatio is 1 (inner and outer band edges coincide)', () => {
    // mock
    const idA = addEllipseNode({ arcRatio: 1 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcDrag(canvas, pointerEvent(50, 0), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TEllipseNode).arcEndAngle).toBe(0);
    expect(dragRef.current?.draggedHandlePosition).toEqual({ x: 50, y: 0 });
  });

  it('should default arcStartAngle/arcEndAngle when the drag somehow targets a non-ellipse node', () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
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
    const idA = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const dragRef = createEllipseArcDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcDrag(canvas, pointerEvent(50, 0), store.dispatch, dragRef);

    // result — no crash, and both angles default to ELLIPSE_DEFAULT_ARC_ANGLE (90) as if uncut
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ arcEndAngle: 0 });
  });

  it('should wrap a rawDelta greater than 180° to the shorter path in the opposite direction', () => {
    // mock — currentArcEndAngle 10°; dragging to compass 350° gives a raw delta of 340°, wrapped to -20°
    const idA = addEllipseNode({ arcEndAngle: 10 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcDrag(canvas, pointerEvent(41.317591, 0.759612), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TEllipseNode).arcEndAngle).toBe(-10);
  });

  it('should wrap a rawDelta less than -180° to the shorter path in the opposite direction', () => {
    // mock — currentArcEndAngle 350°; dragging to compass 10° gives a raw delta of -340°, wrapped to +20°
    const idA = addEllipseNode({ arcEndAngle: 350 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcDrag(canvas, pointerEvent(58.682409, 0.759612), store.dispatch, dragRef);

    // result
    expect((store.getState().design.pages[store.getState().design.activePageId].nodes[idA] as TEllipseNode).arcEndAngle).toBe(370);
  });
});
