// store
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

describe('handlePointerUp', () => {
  it('should do nothing but end the history gesture when no drag was in progress', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: null };
    const refs = createCanvasRefs();

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      'default',
      'default',
      '#000000',
      'Line',
    );

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should commit a line node, release the pointer, clear the draft, and switch back to the default tool', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: { x: 10, y: 10 } };
    const refs = createCanvasRefs();

    // before
    handlePointerUp(
      canvas,
      pointerEvent(60, 40),
      store.dispatch,
      store,
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      'arrow',
      'default',
      '#00ff00',
      'Line',
    );

    // result
    const page = selectActivePage(store.getState());

    expect(page.nodes[page.rootOrder[page.rootOrder.length - 1]]).toMatchObject({
      endPoint: 'arrow',
      startPoint: 'default',
      stroke: '#00ff00',
      type: NodeType.line,
      x1: 10,
      x2: 60,
      y1: 10,
      y2: 40,
    });
    expect(startRef.current).toBeNull();
    expect(refs.draftRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should not add a node when the drag is shorter than the minimum shape size', () => {
    // mock
    const canvas = createCanvas();
    const startRef = { current: { x: 10, y: 10 } };
    const refs = createCanvasRefs();
    const before = selectActivePage(store.getState()).rootOrder.length;

    // before
    handlePointerUp(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      refs,
      IDENTITY_VIEWPORT,
      startRef,
      'default',
      'default',
      '#000000',
      'Line',
    );

    // result
    expect(selectActivePage(store.getState()).rootOrder).toHaveLength(before);
  });
});
