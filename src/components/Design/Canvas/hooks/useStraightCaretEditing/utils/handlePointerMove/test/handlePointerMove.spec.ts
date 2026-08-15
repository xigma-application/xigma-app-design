import { RefObject } from 'react';

// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { handlePointerMove } from '../handlePointerMove';

const ROTATED_BOX: TEditingTextBox = { flipX: false, flipY: false, height: 40, rotation: 180, width: 300, x: 1000, y: 1000 };

const START = { x: 1300, y: 1040 };
const END = { x: 1000, y: 1000 };

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const createOverlay = (content: string): HTMLElement => {
  const overlay = document.createElement('div');

  overlay.setAttribute('contenteditable', 'true');
  overlay.textContent = content;
  document.body.appendChild(overlay);

  return overlay;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointermove', { bubbles: true, button: 0, buttons: 1, clientX: x, clientY: y, pointerId: 1, ...options });

describe('handlePointerMove', () => {
  let overlay: HTMLElement;

  beforeEach(() => {
    store.dispatch(stopTextEdit());
    overlay = createOverlay('Hi');
  });

  afterEach(() => {
    overlay.remove();
  });

  it('should extend the selection from the anchor index to the new hit index', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const anchorIndexRef: RefObject<number | null> = { current: 0 };

    // before
    handlePointerMove(canvas, pointerEvent(END.x, END.y), store.dispatch, anchorIndexRef);

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(2);
  });

  it('should do nothing when no anchor is armed', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const anchorIndexRef: RefObject<number | null> = { current: null };

    // before
    handlePointerMove(canvas, pointerEvent(END.x, END.y), store.dispatch, anchorIndexRef);

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
  });

  it('should do nothing while no button is held', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const anchorIndexRef: RefObject<number | null> = { current: 0 };

    // before
    handlePointerMove(canvas, pointerEvent(END.x, END.y, { buttons: 0 }), store.dispatch, anchorIndexRef);

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
  });

  it('should do nothing once the editing session has ended, even with an armed anchor', () => {
    // mock — no startTextEdit dispatched, so there is no editing box for the hit test to resolve
    const canvas = createCanvas();
    const anchorIndexRef: RefObject<number | null> = { current: 0 };

    // before
    handlePointerMove(canvas, pointerEvent(START.x, START.y), store.dispatch, anchorIndexRef);

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(0);
  });
});
