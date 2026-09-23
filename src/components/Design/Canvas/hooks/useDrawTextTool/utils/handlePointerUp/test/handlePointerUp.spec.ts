// store
import { addNode, setActiveTool, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage, selectEditingNodeId, selectEditingTextBox } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType, ToolName } from 'types/design/enums';

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

const createTextNode = (parentId: string | null = null): string => {
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
      parentId,
      rotation: 0,
      type: NodeType.text,
      width: 1,
      x: 10,
      y: 10,
    }),
  );

  return payload.id;
};

const createHorizontalAutoLayoutFrame = (): string => {
  const { payload } = store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
      height: 100,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 400,
      x: 0,
      y: 0,
    }),
  );

  store.dispatch(updateNode({ changes: { layoutMode: LayoutMode.horizontal }, id: payload.id }));

  return payload.id;
};

const createRectangle = (parentId: string): string => {
  const { payload } = store.dispatch(
    addNode({
      fills: [{ color: '#ffffff', opacity: 100, type: 'solid' }],
      height: 50,
      name: 'Rectangle',
      parentId,
      rotation: 0,
      type: NodeType.rectangle,
      width: 50,
      x: 0,
      y: 0,
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
      store,
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
      store,
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
      store,
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

  it('should open the edit overlay at the auto-layout-resolved position, not the raw drag rect, when the node lands in a horizontal auto-layout frame', () => {
    // mock — a frame with an existing child fills the left slot; the raw drag rect below is far
    // from the frame entirely, so if the overlay ever used it directly this assertion would fail
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const frameId = createHorizontalAutoLayoutFrame();
    const siblingId = createRectangle(frameId);
    const nodeId = createTextNode(frameId);

    store.dispatch(setSelection([nodeId]));

    // before
    handlePointerUp(
      canvas,
      pointerEvent(600, 600),
      store.dispatch,
      store,
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 500, y: 500 } },
      { current: nodeId },
      { current: [] },
      { current: null },
    );

    // result
    const resolvedNode = selectActivePage(store.getState()).nodes[nodeId];
    const sibling = selectActivePage(store.getState()).nodes[siblingId];

    expect(resolvedNode.x).not.toBe(500);
    expect(resolvedNode.x).toBeGreaterThanOrEqual(sibling.x + sibling.width);
    expect(selectEditingTextBox(store.getState())).toMatchObject({ x: resolvedNode.x, y: resolvedNode.y });
  });
});
