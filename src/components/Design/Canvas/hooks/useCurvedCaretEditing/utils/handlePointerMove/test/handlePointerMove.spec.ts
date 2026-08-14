import { RefObject } from 'react';

// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { handlePointerMove } from '../handlePointerMove';

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

const BOTTOM = { x: 1100, y: 1200 };

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

const pointerEvent = (x: number, y: number, buttons = 1): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y });

const createRefs = (
  anchorIndex: number | null,
  isDraggingOffset: boolean,
): { anchorIndexRef: RefObject<number | null>; isDraggingOffsetRef: RefObject<boolean> } => ({
  anchorIndexRef: { current: anchorIndex },
  isDraggingOffsetRef: { current: isDraggingOffset },
});

describe('handlePointerMove', () => {
  let overlay: HTMLElement;

  beforeEach(() => {
    store.dispatch(stopTextEdit());
    overlay = createOverlay('Hi');
  });

  afterEach(() => {
    overlay.remove();
  });

  it('should continue the offset-handle drag and not touch the text selection when one is armed', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const refs = createRefs(null, true);

    // before
    handlePointerMove(canvas, pointerEvent(BOTTOM.x, BOTTOM.y), store.dispatch, refs.anchorIndexRef, refs.isDraggingOffsetRef);

    // result
    expect(store.getState().design.editingTextBox).toMatchObject({ pathStartOffset: expect.closeTo(0.25, 2) });
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe(0);
  });

  it('should not continue the offset-handle drag once the pointer button is released', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const refs = createRefs(null, true);

    // before
    handlePointerMove(canvas, pointerEvent(BOTTOM.x, BOTTOM.y, 0), store.dispatch, refs.anchorIndexRef, refs.isDraggingOffsetRef);

    // result
    expect(store.getState().design.editingTextBox).toMatchObject({ pathStartOffset: 0 });
  });

  it('should extend the selection from the anchor index when dragging over the curve', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const refs = createRefs(0, false);

    // before
    handlePointerMove(canvas, pointerEvent(BOTTOM.x, BOTTOM.y), store.dispatch, refs.anchorIndexRef, refs.isDraggingOffsetRef);

    // result
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe(2);
  });

  it('should do nothing when there is no anchor and no offset drag in progress', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const refs = createRefs(null, false);

    // before
    handlePointerMove(canvas, pointerEvent(BOTTOM.x, BOTTOM.y), store.dispatch, refs.anchorIndexRef, refs.isDraggingOffsetRef);

    // result
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe(0);
  });
});
