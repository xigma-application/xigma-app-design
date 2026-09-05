// store
import { setActiveTool } from 'store/design/slice';
import { selectEditingTextBox } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

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
    store.dispatch(setActiveTool(ToolName.text));
  });

  it('should do nothing when the drag never started', () => {
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
      { current: [] },
    );

    // result
    expect(selectEditingTextBox(store.getState())).toBeNull();
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should start editing a text box at the dragged rect, then switch back to the default tool', () => {
    // mock
    const canvas = createCanvas();
    const refs = createCanvasRefs();

    // before
    handlePointerUp(canvas, pointerEvent(60, 40), store.dispatch, refs, IDENTITY_VIEWPORT, { current: { x: 10, y: 10 } }, { current: [] });

    // result
    expect(selectEditingTextBox(store.getState())).toMatchObject({ height: 30, width: 50, x: 10, y: 10 });
    expect(refs.draftRef.current).toBeNull();
    expect(refs.transform.alignmentGuideRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should start editing a default-sized text box anchored at the click point (not centered) when the drag is a plain click', () => {
    // before
    handlePointerUp(
      createCanvas(),
      pointerEvent(10, 10),
      store.dispatch,
      createCanvasRefs(),
      IDENTITY_VIEWPORT,
      { current: { x: 10, y: 10 } },
      { current: [] },
    );

    // result
    expect(selectEditingTextBox(store.getState())).toMatchObject({ height: 100, width: 100, x: 10, y: 10 });
  });
});
