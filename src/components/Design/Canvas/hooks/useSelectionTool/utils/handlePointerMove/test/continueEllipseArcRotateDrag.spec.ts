import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { continueEllipseArcRotateDrag } from '../continueEllipseArcRotateDrag';
import { TEllipseArcRotateDragState } from 'types/design/canvas/types';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createEllipseArcRotateDragRef = (
  dragState: TEllipseArcRotateDragState | null = null,
): RefObject<TEllipseArcRotateDragState | null> => ({ current: dragState });

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

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('continueEllipseArcRotateDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no ellipse-arc rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueEllipseArcRotateDrag(canvas, pointerEvent(10, 10), store.dispatch, createEllipseArcRotateDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should rotate both arcStartAngle and arcEndAngle by the same delta, preserving the sweep width', () => {
    // mock — a 90° cut (start 90, end 0); dragging to the south rim (compass 180) shifts both by +90°
    const idA = addEllipseNode({ arcEndAngle: 0, arcStartAngle: 90 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcRotateDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcRotateDrag(canvas, pointerEvent(50, 100), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[idA] as TEllipseNode;

    expect(node.arcStartAngle).toBe(180);
    expect(node.arcEndAngle).toBe(90);
  });

  it('should not divide by zero when arcRatio is 1 (inner and outer band edges coincide)', () => {
    // mock
    const idA = addEllipseNode({ arcEndAngle: 0, arcRatio: 1, arcStartAngle: 90 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcRotateDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcRotateDrag(canvas, pointerEvent(50, 100), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[idA] as TEllipseNode;

    expect(node.arcStartAngle).toBe(180);
    expect(dragRef.current?.draggedHandlePosition).toEqual({ x: 50, y: 100 });
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
    const { rootOrder } = store.getState().design;
    const idA = rootOrder[rootOrder.length - 1];
    const canvas = createCanvas();
    const dragRef = createEllipseArcRotateDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcRotateDrag(canvas, pointerEvent(50, 0), store.dispatch, dragRef);

    // result — no crash, both angles default to ELLIPSE_DEFAULT_ARC_ANGLE (90) as if uncut
    expect(store.getState().design.nodes[idA]).toMatchObject({ arcEndAngle: 0, arcStartAngle: 0 });
  });

  it('should wrap a rawDelta greater than 180° to the shorter path in the opposite direction', () => {
    // mock — currentArcStartAngle 10°; dragging to compass 350° gives a raw delta of 340°, wrapped to -20°
    const idA = addEllipseNode({ arcStartAngle: 10 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcRotateDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcRotateDrag(canvas, pointerEvent(41.317591, 0.759612), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TEllipseNode).arcStartAngle).toBe(-10);
  });

  it('should wrap a rawDelta less than -180° to the shorter path in the opposite direction', () => {
    // mock — currentArcStartAngle 350°; dragging to compass 10° gives a raw delta of -340°, wrapped to +20°
    const idA = addEllipseNode({ arcStartAngle: 350 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcRotateDragRef({
      bounds: BOUNDS,
      draggedHandlePosition: null,
      flipX: false,
      flipY: false,
      nodeId: idA,
      rotation: 0,
    });

    // before
    continueEllipseArcRotateDrag(canvas, pointerEvent(58.682409, 0.759612), store.dispatch, dragRef);

    // result
    expect((store.getState().design.nodes[idA] as TEllipseNode).arcStartAngle).toBe(370);
  });
});
