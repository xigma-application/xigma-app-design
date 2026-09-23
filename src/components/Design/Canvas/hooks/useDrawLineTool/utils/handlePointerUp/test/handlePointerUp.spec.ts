// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { handlePointerUp } from '../handlePointerUp';

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1, ...options });

const createLineNode = (x1: number, y1: number): string => {
  const { payload } = store.dispatch(
    addNode({
      endPoint: 'default',
      name: 'Line',
      parentId: null,
      startPoint: 'default',
      stroke: '#000000',
      type: NodeType.line,
      x1,
      x2: x1,
      y1,
      y2: y1,
    }),
  );

  return payload.id;
};

describe('handlePointerUp', () => {
  it('should do nothing but end the history gesture when no drag was in progress', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: null };
    const refs = createCanvasRefs();
    const dropTargetRef = { current: null };

    // before
    handlePointerUp(canvas, pointerEvent(10, 10), store.dispatch, refs, IDENTITY_VIEWPORT, startRef, { current: null }, dropTargetRef);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should snap the in-progress line to its final endpoint, release the pointer, and switch back to the default tool', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const dropTargetRef = { current: null };
    const nodeId = createLineNode(10, 10);

    store.dispatch(setSelection([nodeId]));
    refs.drawing.cancelDrawRef.current = (): void => undefined;

    const startRef = { current: { x: 10, y: 10 } };

    // before
    handlePointerUp(canvas, pointerEvent(60, 40), store.dispatch, refs, IDENTITY_VIEWPORT, startRef, { current: nodeId }, dropTargetRef);

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[nodeId]).toMatchObject({ type: NodeType.line, x1: 10, x2: 60, y1: 10, y2: 40 });
    expect(startRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
    expect(refs.drawing.cancelDrawRef.current).toBeNull();
  });

  it('should delete the in-progress node when the drag is shorter than the minimum shape size', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const dropTargetRef = { current: null };
    const nodeId = createLineNode(10, 10);
    const before = selectActivePage(store.getState()).rootOrder.length;

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 10, y: 10 } },
      { current: nodeId },
      dropTargetRef,
    );

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(before - 1);
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeUndefined();
  });
});
