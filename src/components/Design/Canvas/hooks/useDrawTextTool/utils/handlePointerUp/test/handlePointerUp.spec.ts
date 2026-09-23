// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { selectActivePage, selectEditingNodeId, selectEditingTextBox } from 'store/design/selectors';
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

const createTextNode = (): string => {
  const { payload } = store.dispatch(
    addNode({
      content: '',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter MSDF',
      fontSize: 14,
      height: 1,
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 1,
      x: 10,
      y: 10,
    }),
  );

  return payload.id;
};

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.text));
  });

  it('should do nothing but end the history gesture when the drag never started', () => {
    // mock
    const canvas = createCanvas();

    // before
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
    );

    // result
    expect(selectEditingTextBox(store.getState())).toBeNull();
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should snap the box to its final size and start editing the already-created node, then switch back to the default tool', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const nodeId = createTextNode();

    store.dispatch(setSelection([nodeId]));
    refs.drawing.cancelDrawRef.current = (): void => undefined;

    // before
    handlePointerUp(
      canvas,
      pointerEvent(60, 40),
      store.dispatch,
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 10, y: 10 } },
      { current: nodeId },
      { current: [] },
      { current: null },
    );

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[nodeId]).toMatchObject({ height: 30, type: NodeType.text, width: 50, x: 10, y: 10 });
    expect(selectEditingNodeId(store.getState())).toBe(nodeId);
    expect(selectEditingTextBox(store.getState())).toMatchObject({ height: 30, width: 50, x: 10, y: 10 });
    expect(refs.transform.alignmentGuideRef.current).toBeNull();
    expect(refs.drawing.cancelDrawRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should fall back to a default-sized, top-left-anchored box when the drag is a plain click', () => {
    // mock
    const nodeId = createTextNode();

    // before
    handlePointerUp(
      createCanvas(),
      pointerEvent(10, 10),
      store.dispatch,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      { current: { x: 10, y: 10 } },
      { current: nodeId },
      { current: [] },
      { current: null },
    );

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ height: 100, width: 100, x: 10, y: 10 });
  });
});
