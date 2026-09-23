// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
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
  new PointerEvent('pointerup', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const createFrameNode = (): string => {
  const { payload } = store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [],
      height: 1,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 1,
      x: 20,
      y: 20,
    }),
  );

  return payload.id;
};

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.frame));
  });

  it('should do nothing but end the history gesture when the drag never started', () => {
    // mock
    const canvas = createCanvas();

    // before & result — must not throw even with no pending shape
    expect(() =>
      handlePointerUp(
        canvas,
        pointerEvent(50, 50),
        store.dispatch,
        createCanvasRefs(),
        IDENTITY_VIEWPORT,
        { current: null },
        { current: null },
        {
          current: [],
        },
        { current: null },
      ),
    ).not.toThrow();

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should snap the in-progress shape to its final size, keep it selected, and reset the tool', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const nodeId = createFrameNode();

    store.dispatch(setSelection([nodeId]));
    refs.drawing.cancelDrawRef.current = (): void => undefined;

    // before
    handlePointerUp(
      canvas,
      pointerEvent(120, 130),
      store.dispatch,
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: nodeId },
      { current: [] },
      { current: null },
    );

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[nodeId]).toMatchObject({ height: 110, type: NodeType.frame, width: 100 });
    expect(page.selectedIds).toEqual([nodeId]);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
    // once the shape is committed, Escape must no longer try to cancel it
    expect(refs.drawing.cancelDrawRef.current).toBeNull();
  });

  it('should fall back to the default size when the drag never cleared the minimum distance', () => {
    // mock
    const canvas = createCanvas();
    const nodeId = createFrameNode();

    // before
    handlePointerUp(
      canvas,
      pointerEvent(21, 21),
      store.dispatch,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      { current: { x: 20, y: 20 } },
      { current: nodeId },
      { current: [] },
      { current: null },
    );

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[nodeId]).toMatchObject({ height: 100, width: 100 });
  });
});
