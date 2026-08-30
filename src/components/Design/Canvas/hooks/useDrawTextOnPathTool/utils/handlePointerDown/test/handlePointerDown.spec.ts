import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';

// store
import { addNode, setActiveTool, setSelection, setViewport } from 'store/design/slice';
import { selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from '../handlePointerDown';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, button = 0): PointerEvent =>
  new PointerEvent('pointerdown', { button, clientX: x, clientY: y, pointerId: 1 });

const createPointRef = (): RefObject<TPoint | null> => ({ current: null });
const createStringRef = (): RefObject<string | null> => ({ current: null });

const addStraightVector = (offsetX: number): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: offsetX, y: 0 }, b: { id: 'b', x: offsetX + 100, y: 0 } },
    }),
  );

  const { rootOrder } = store.getState().design.pages[store.getState().design.activePageId];

  return rootOrder[rootOrder.length - 1];
};

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.textOnPath));
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createPointRef();
    const attachTargetIdRef = createStringRef();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, 1),
      store.dispatch,
      createCanvasRefs(),
      { x: 0, y: 0, zoom: 1 },
      startRef,
      attachTargetIdRef,
    );

    // result
    expect(startRef.current).toBeNull();
    expect(canvas.setPointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the current selection, capture the pointer, and record the world-space start point', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createPointRef();
    const attachTargetIdRef = createStringRef();

    store.dispatch(setSelection(['whatever']));

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      createCanvasRefs(),
      { x: 0, y: 0, zoom: 1 },
      startRef,
      attachTargetIdRef,
    );

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    expect(startRef.current).toEqual({ x: 10, y: 10 });
  });

  it('should arm attachment when the press lands on an eligible vector path', () => {
    // mock
    const nodeId = addStraightVector(1500);
    const canvas = createCanvas();
    const startRef = createPointRef();
    const attachTargetIdRef = createStringRef();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(1550, 0),
      store.dispatch,
      createCanvasRefs(),
      { x: 0, y: 0, zoom: 1 },
      startRef,
      attachTargetIdRef,
    );

    // result
    expect(attachTargetIdRef.current).toBe(nodeId);
  });

  it('should leave attachment unarmed when the press lands on empty canvas', () => {
    // mock
    const canvas = createCanvas();
    const startRef = createPointRef();
    const attachTargetIdRef = createStringRef();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(9999, 9999),
      store.dispatch,
      createCanvasRefs(),
      { x: 0, y: 0, zoom: 1 },
      startRef,
      attachTargetIdRef,
    );

    // result
    expect(attachTargetIdRef.current).toBeNull();
  });
});
