import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { useRotatedCaretEditing } from './useRotatedCaretEditing';

// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

const ROTATED_BOX: TEditingTextBox = { flipX: false, flipY: false, height: 40, rotation: 180, width: 300, x: 1000, y: 1000 };
const FLIPPED_BOX: TEditingTextBox = { ...ROTATED_BOX, flipX: true, rotation: 0 };
const PLAIN_BOX: TEditingTextBox = { ...ROTATED_BOX, rotation: 0 };

const START = { x: 1300, y: 1040 };
const END = { x: 1000, y: 1000 };

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

const renderRotatedCaretEditing = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useRotatedCaretEditing(canvasRef), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useRotatedCaretEditing behaviors', () => {
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

  it('should place the caret at the nearest index on a 180-degree rotated box', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    // before
    renderRotatedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', START.x, START.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
    expect(document.activeElement).toBe(overlay);
  });

  it('should extend the selection from the anchor index while dragging on a rotated box', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    // before
    renderRotatedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', START.x, START.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', END.x, END.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(2);
  });

  it('should place the caret correctly on a horizontally flipped (unrotated) box', () => {
    // mock — flipped reverses reading order the same way a 180-degree rotation does
    store.dispatch(startTextEdit({ box: FLIPPED_BOX, content: 'Hi' }));

    // before
    renderRotatedCaretEditing(canvasRef);

    // action — the box's own left edge is where the flipped content ends
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1002, 1010));
    });

    // result
    expect(store.getState().design.editingSelectionStart).toBe(2);
  });

  it('should not attach any listeners for a plain, unrotated and unflipped box', () => {
    // mock
    store.dispatch(startTextEdit({ box: PLAIN_BOX, content: 'Hi' }));

    // before
    renderRotatedCaretEditing(canvasRef);

    // action
    expect(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', START.x, START.y));
    }).not.toThrow();

    // result — native DOM hit-testing owns this box; the hook must never override it
    expect(document.activeElement).not.toBe(overlay);
  });

  it('should stop extending the selection once the pointer is released', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    // before
    renderRotatedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', START.x, START.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', START.x, START.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', END.x, END.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
  });

  it('should treat a drag as a miss once the editing session switches to a path-text box mid-gesture, before the listener is torn down', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    // before
    renderRotatedCaretEditing(canvasRef);

    // action — the effect cleanup for the now-stale listener is deferred until this batch commits,
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', START.x, START.y));
      store.dispatch(startTextEdit({ box: { ...ROTATED_BOX, pathId: 'ellipse-1' }, content: 'Hi' }));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', END.x, END.y));
    });

    // result
    expect(store.getState().design.editingTextBox?.pathId).toBe('ellipse-1');
  });

  it('should ignore pointer events that land outside the canvas and the editing overlay', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const outsideElement = document.createElement('div');

    document.body.appendChild(outsideElement);

    // before
    renderRotatedCaretEditing(canvasRef);

    // action
    act(() => {
      outsideElement.dispatchEvent(pointerEvent('pointerdown', START.x, START.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', END.x, END.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);

    // after
    outsideElement.remove();
  });
});
