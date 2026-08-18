import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { continueEllipseArcRatioDrag } from '../continueEllipseArcRatioDrag';
import { TEllipseArcRatioDragState } from 'types/design/canvas/types';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createEllipseArcRatioDragRef = (dragState: TEllipseArcRatioDragState | null = null): RefObject<TEllipseArcRatioDragState | null> => ({
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

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const dragState = (nodeId: string): TEllipseArcRatioDragState => ({
  bounds: BOUNDS,
  draggedHandlePosition: null,
  flipX: false,
  flipY: false,
  nodeId,
  rotation: 0,
});

describe('continueEllipseArcRatioDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no ellipse-arc ratio drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueEllipseArcRatioDrag(canvas, pointerEvent(10, 10), store.dispatch, createEllipseArcRatioDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should dispatch arcRatio from the radial distance and leave arcRatioInverted false inside the filled majority', () => {
    // mock — majorArc(0, 90) is {majorStart: 90, majorSweep: 270}; compass 90° (east, distance 30) is inside it
    const idA = addEllipseNode({ arcEndAngle: 90, arcStartAngle: 0 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcRatioDragRef(dragState(idA));

    // before
    continueEllipseArcRatioDrag(canvas, pointerEvent(80, 50), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[idA] as TEllipseNode;

    expect(node.arcRatio).toBe(0.6);
    expect(node.arcRatioInverted).toBe(false);
  });

  it('should set arcRatioInverted true when the pointer lands inside the cut-away gap instead', () => {
    // mock — compass 45° sits inside the 0°-90° gap, the complement of the filled majority above
    const idA = addEllipseNode({ arcEndAngle: 90, arcStartAngle: 0 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcRatioDragRef(dragState(idA));

    // before
    continueEllipseArcRatioDrag(canvas, pointerEvent(85.355339, 14.644661), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[idA] as TEllipseNode;

    expect(node.arcRatio).toBe(1);
    expect(node.arcRatioInverted).toBe(true);
  });

  it('should clamp both the dispatched arcRatio and the visually-followed handle position at the max ratio', () => {
    // mock — pointer 60 world units out (normalized 1.2) on a bounds radius of 50; max ratio is 1
    const idA = addEllipseNode({ arcEndAngle: 90, arcStartAngle: 0 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcRatioDragRef(dragState(idA));

    // before
    continueEllipseArcRatioDrag(canvas, pointerEvent(110, 50), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[idA] as TEllipseNode;

    expect(node.arcRatio).toBe(1);
    expect(dragRef.current?.draggedHandlePosition).toEqual({ x: 100, y: 50 });
  });

  it('should keep the dragged handle position at dead center when the pointer sits exactly on center', () => {
    // mock — rawRatio is 0, so the follow-scale ternary takes its zero branch instead of dividing by it
    const idA = addEllipseNode({ arcEndAngle: 90, arcStartAngle: 0 });
    const canvas = createCanvas();
    const dragRef = createEllipseArcRatioDragRef(dragState(idA));

    // before
    continueEllipseArcRatioDrag(canvas, pointerEvent(50, 50), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[idA] as TEllipseNode;

    expect(node.arcRatio).toBe(0);
    expect(dragRef.current?.draggedHandlePosition).toEqual({ x: 50, y: 50 });
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
    const dragRef = createEllipseArcRatioDragRef(dragState(idA));

    // before
    continueEllipseArcRatioDrag(canvas, pointerEvent(80, 50), store.dispatch, dragRef);

    // result — no crash; both angles default to ELLIPSE_DEFAULT_ARC_ANGLE (90), a full circle with no gap
    expect(store.getState().design.nodes[idA]).toMatchObject({ arcRatio: 0.6, arcRatioInverted: false });
  });
});
