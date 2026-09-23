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

const createPolygonNode = (sides: number): string => {
  const { payload } = store.dispatch(
    addNode({
      fill: '#d9d9d9',
      flipX: false,
      flipY: false,
      height: 1,
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides,
      type: NodeType.polygon,
      width: 1,
      x: 10,
      y: 10,
    }),
  );

  return payload.id;
};

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.polygon));
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

  it('should snap the in-progress polygon to its final size, keep it selected, and switch back to the default tool', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();
    const nodeId = createPolygonNode(5);

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

    expect(page.nodes[nodeId]).toMatchObject({ height: 30, sides: 5, type: NodeType.polygon, width: 50, x: 10, y: 10 });
    expect(page.selectedIds).toEqual([nodeId]);
    expect(refs.transform.alignmentGuideRef.current).toBeNull();
    expect(refs.transform.aspectRatioLockGuideRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
    expect(refs.drawing.cancelDrawRef.current).toBeNull();
  });

  it('should fall back to the default size when the drag is a plain click', () => {
    // mock
    const nodeId = createPolygonNode(3);

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
    expect(selectActivePage(store.getState()).nodes[nodeId]).toMatchObject({ height: 100, width: 100 });
  });
});
