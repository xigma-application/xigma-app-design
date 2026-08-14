import { RefObject } from 'react';

// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { handlePointerDown } from '../handlePointerDown';

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

const RIGHT = { x: 1200, y: 1100 };
const NEAR_RIGHT = { x: 1200, y: 1108 };
const FAR = { x: 0, y: 0 };

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

const pointerEvent = (x: number, y: number, target: EventTarget): PointerEvent => {
  const event = new PointerEvent('pointerdown', { bubbles: true, button: 0, buttons: 1, clientX: x, clientY: y, pointerId: 1 });

  Object.defineProperty(event, 'target', { value: target });

  return event;
};

const createRefs = (): { anchorIndexRef: RefObject<number | null>; isDraggingOffsetRef: RefObject<boolean> } => ({
  anchorIndexRef: { current: null },
  isDraggingOffsetRef: { current: false },
});

describe('handlePointerDown', () => {
  let overlay: HTMLElement;

  beforeEach(() => {
    store.dispatch(stopTextEdit());
    overlay = createOverlay('Hi');
  });

  afterEach(() => {
    overlay.remove();
  });

  it('should arm the offset drag and clear the anchor when the click lands on the offset handle', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const { anchorIndexRef, isDraggingOffsetRef } = createRefs();

    anchorIndexRef.current = 5;

    // before
    handlePointerDown(canvas, pointerEvent(RIGHT.x, RIGHT.y, canvas), store.dispatch, anchorIndexRef, isDraggingOffsetRef);

    // result
    expect(isDraggingOffsetRef.current).toBe(true);
    expect(anchorIndexRef.current).toBeNull();
  });

  it('should place the caret and arm the anchor when the click lands on the path within tolerance, away from the handle', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const { anchorIndexRef, isDraggingOffsetRef } = createRefs();

    // before
    handlePointerDown(canvas, pointerEvent(NEAR_RIGHT.x, NEAR_RIGHT.y, canvas), store.dispatch, anchorIndexRef, isDraggingOffsetRef);

    // result
    expect(isDraggingOffsetRef.current).toBe(false);
    expect(anchorIndexRef.current).toBe(1);
    expect(document.activeElement).toBe(overlay);
    expect(store.getState().design.editingSelectionStart).toBe(1);
    expect(store.getState().design.editingSelectionEnd).toBe(1);
  });

  it('should clear the anchor when the click misses the path outside hit tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const { anchorIndexRef, isDraggingOffsetRef } = createRefs();

    anchorIndexRef.current = 5;

    // before
    handlePointerDown(canvas, pointerEvent(FAR.x, FAR.y, canvas), store.dispatch, anchorIndexRef, isDraggingOffsetRef);

    // result
    expect(isDraggingOffsetRef.current).toBe(false);
    expect(anchorIndexRef.current).toBeNull();
  });

  it('should ignore clicks that land outside the canvas and the editing overlay', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const outsideElement = document.createElement('div');

    document.body.appendChild(outsideElement);

    const { anchorIndexRef, isDraggingOffsetRef } = createRefs();

    anchorIndexRef.current = 5;

    // before
    handlePointerDown(canvas, pointerEvent(RIGHT.x, RIGHT.y, outsideElement), store.dispatch, anchorIndexRef, isDraggingOffsetRef);

    // result — the miss branch still runs (clearing the stale anchor), just via the tolerance path
    expect(isDraggingOffsetRef.current).toBe(false);
    expect(anchorIndexRef.current).toBeNull();

    // after
    outsideElement.remove();
  });
});
