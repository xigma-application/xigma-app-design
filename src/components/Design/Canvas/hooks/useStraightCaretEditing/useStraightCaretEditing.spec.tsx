import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useStraightCaretEditing } from './useStraightCaretEditing';

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

const doubleClickEvent = (x: number, y: number): MouseEvent =>
  new MouseEvent('dblclick', { bubbles: true, button: 0, clientX: x, clientY: y });

const renderStraightCaretEditing = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useStraightCaretEditing(createCanvasRefs({ canvasRef })), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
};

describe('useStraightCaretEditing behaviors', () => {
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
    renderStraightCaretEditing(canvasRef);

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

  it('should select the whole word (not just a collapsed caret) when double-clicking within tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    // before
    renderStraightCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(START.x, START.y));
    });

    // result — "Hi" is a single word, so the whole 2-character content is selected
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(2);
    expect(document.activeElement).toBe(overlay);
  });

  it('should do nothing when double-clicking outside hit tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    // before
    renderStraightCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(0, 0));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
    expect(document.activeElement).not.toBe(overlay);
  });

  it('should extend the selection from the anchor index while dragging on a rotated box', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    // before
    renderStraightCaretEditing(canvasRef);

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
    renderStraightCaretEditing(canvasRef);

    // action — the box's own left edge is where the flipped content ends
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1002, 1010));
    });

    // result
    expect(store.getState().design.editingSelectionStart).toBe(2);
  });

  it('should place the caret correctly on a plain, unrotated and unflipped box, since the overlay itself never receives the click', () => {
    // mock
    store.dispatch(startTextEdit({ box: PLAIN_BOX, content: 'Hi' }));

    // before
    renderStraightCaretEditing(canvasRef);

    // action — the box's own left edge, same point used for the flipped-box assertion above
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 1002, 1010));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(document.activeElement).toBe(overlay);
  });

  it('should stop extending the selection once the pointer is released', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    // before
    renderStraightCaretEditing(canvasRef);

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
    renderStraightCaretEditing(canvasRef);

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
    renderStraightCaretEditing(canvasRef);

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

  it('should ignore a double-click that lands outside the canvas and the editing overlay', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const outsideElement = document.createElement('div');

    document.body.appendChild(outsideElement);

    // before
    renderStraightCaretEditing(canvasRef);

    // action
    act(() => {
      outsideElement.dispatchEvent(doubleClickEvent(START.x, START.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
    expect(document.activeElement).not.toBe(overlay);

    // after
    outsideElement.remove();
  });
});
