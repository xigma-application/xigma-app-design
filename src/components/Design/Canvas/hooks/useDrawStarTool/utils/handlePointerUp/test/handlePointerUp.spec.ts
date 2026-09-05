// store
import { setActiveTool } from 'store/design/slice';
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

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.star));
  });

  it('should do nothing but end the history gesture when the drag never started', () => {
    // mock
    const canvas = createCanvas();
    const nodesBefore = selectActivePage(store.getState()).rootOrder.length;

    // before & result — must not throw even with no pending shape
    expect(() =>
      handlePointerUp(
        canvas,
        pointerEvent(50, 50),
        store.dispatch,
        store,
        createCanvasRefs(),
        IDENTITY_VIEWPORT,
        { current: null },
        { current: [] },
        '#ff0000',
        'Star',
        5,
        0.5,
      ),
    ).not.toThrow();

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(nodesBefore);
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should commit a star node with the configured fill, points, and ratio, then switch back to the default tool', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerUp(
      canvas,
      pointerEvent(60, 40),
      store.dispatch,
      store,
      refs,
      IDENTITY_VIEWPORT,
      { current: { x: 10, y: 10 } },
      { current: [] },
      '#d9d9d9',
      'Star',
      6,
      0.4,
    );

    // result
    const page = selectActivePage(store.getState());
    const newId = page.rootOrder.at(-1) as string;

    expect(page.nodes[newId]).toMatchObject({
      fill: '#d9d9d9',
      height: 30,
      points: 6,
      ratio: 0.4,
      type: NodeType.star,
      width: 50,
      x: 10,
      y: 10,
    });
    expect(page.selectedIds).toEqual([newId]);
    expect(refs.draftRef.current).toBeNull();
    expect(refs.transform.alignmentGuideRef.current).toBeNull();
    expect(refs.transform.aspectRatioLockGuideRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should add a default-sized node centered on the click point when the drag is a plain click', () => {
    // before
    handlePointerUp(
      createCanvas(),
      pointerEvent(10, 10),
      store.dispatch,
      store,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      { current: { x: 10, y: 10 } },
      { current: [] },
      '#d9d9d9',
      'Star',
      5,
      0.5,
    );

    // result
    const page = selectActivePage(store.getState());
    const newId = page.rootOrder.at(-1) as string;

    expect(page.nodes[newId]).toMatchObject({ height: 100, width: 100, x: -40, y: -40 });
  });
});
