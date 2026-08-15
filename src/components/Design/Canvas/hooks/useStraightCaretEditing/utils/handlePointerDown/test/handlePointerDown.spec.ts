import { RefObject } from 'react';

// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { handlePointerDown } from '../handlePointerDown';

const ROTATED_BOX: TEditingTextBox = { flipX: false, flipY: false, height: 40, rotation: 180, width: 300, x: 1000, y: 1000 };

const START = { x: 1300, y: 1040 };
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

const createAnchorRef = (): RefObject<number | null> => ({ current: null });

describe('handlePointerDown', () => {
  let overlay: HTMLElement;

  beforeEach(() => {
    store.dispatch(stopTextEdit());
    overlay = createOverlay('Hi');
  });

  afterEach(() => {
    overlay.remove();
  });

  it('should place the caret and arm the anchor when the click lands within tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const anchorIndexRef = createAnchorRef();

    // before
    handlePointerDown(canvas, pointerEvent(START.x, START.y, canvas), store.dispatch, anchorIndexRef);

    // result
    expect(anchorIndexRef.current).toBe(0);
    expect(document.activeElement).toBe(overlay);
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe(0);
  });

  it('should clear the anchor when the click misses outside hit tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const anchorIndexRef = createAnchorRef();

    anchorIndexRef.current = 5;

    // before
    handlePointerDown(canvas, pointerEvent(FAR.x, FAR.y, canvas), store.dispatch, anchorIndexRef);

    // result
    expect(anchorIndexRef.current).toBeNull();
  });

  it('should ignore clicks that land outside the canvas and the editing overlay', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const outsideElement = document.createElement('div');

    document.body.appendChild(outsideElement);

    const anchorIndexRef = createAnchorRef();

    anchorIndexRef.current = 5;

    // before
    handlePointerDown(canvas, pointerEvent(START.x, START.y, outsideElement), store.dispatch, anchorIndexRef);

    // result
    expect(anchorIndexRef.current).toBeNull();

    // after
    outsideElement.remove();
  });
});
