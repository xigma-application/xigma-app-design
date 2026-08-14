import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { useCurvedCaretEditing } from './useCurvedCaretEditing';

// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

const CIRCLE_BOX: TEditingTextBox = {
  flipX: false,
  flipY: false,
  height: 200,
  pathFlip: false,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  width: 200,
  x: 1000,
  y: 1000,
};

// the circle's rightmost point sits exactly at pathStartOffset 0 -> index 0, well within hit tolerance
const RIGHT = { x: 1200, y: 1100 };
// a quarter-turn away -> "Hi"'s two characters don't reach nearly that far, so the hit clamps to index 2
const BOTTOM = { x: 1100, y: 1200 };
// nowhere near the ellipse at all
const FAR = { x: 0, y: 0 };

const createCanvasRef = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  document.body.appendChild(canvas);

  return { current: canvas };
};

const createOverlay = (content: string): HTMLElement => {
  const overlay = document.createElement('div');

  overlay.setAttribute('contenteditable', 'true');
  overlay.textContent = content;
  document.body.appendChild(overlay);

  return overlay;
};

const pointerEvent = (type: string, x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent(type, { bubbles: true, button: 0, buttons: 1, clientX: x, clientY: y, pointerId: 1, ...options });

const renderCurvedCaretEditing = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useCurvedCaretEditing(canvasRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useCurvedCaretEditing behaviors', () => {
  let canvasRef: RefObject<HTMLCanvasElement | null>;
  let overlay: HTMLElement;

  beforeEach(() => {
    store.dispatch(stopTextEdit());
    canvasRef = createCanvasRef();
    overlay = createOverlay('Hi');
  });

  afterEach(() => {
    canvasRef.current?.remove();
    overlay.remove();
  });

  it('should place the caret at the nearest index when clicking on the path within tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
    expect(document.activeElement).toBe(overlay);
  });

  it('should extend the selection from the anchor index while dragging', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(2);
  });

  it('should stop extending the selection once the pointer is released', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', RIGHT.x, RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
  });

  it('should not arm a drag when the initial click misses the path outside hit tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', FAR.x, FAR.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result — never armed, so the drag must not extend the selection
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
  });

  it('should ignore pointer events that land outside the canvas and the editing overlay', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const outsideElement = document.createElement('div');

    document.body.appendChild(outsideElement);

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      outsideElement.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);

    // after
    outsideElement.remove();
  });

  it('should treat a drag as a miss once the editing session ends mid-gesture, before the listener is torn down', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action — the effect's cleanup for the now-stale listener is deferred until this batch commits,
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
      store.dispatch(stopTextEdit());
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should not attach any listeners, and therefore do nothing, when there is no path-text editing session', () => {
    // before — stopTextEdit in beforeEach already left editingTextBox null
    renderCurvedCaretEditing(canvasRef);

    // action
    expect(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
    }).not.toThrow();

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });
});
