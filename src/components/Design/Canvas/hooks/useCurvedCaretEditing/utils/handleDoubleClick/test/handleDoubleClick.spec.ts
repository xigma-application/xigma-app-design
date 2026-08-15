import { RefObject } from 'react';

// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { handleDoubleClick } from '../handleDoubleClick';

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

const doubleClickEvent = (x: number, y: number, target: EventTarget): MouseEvent => {
  const event = new MouseEvent('dblclick', { bubbles: true, button: 0, clientX: x, clientY: y });

  Object.defineProperty(event, 'target', { value: target });

  return event;
};

const createAnchorRef = (): RefObject<number | null> => ({ current: null });

describe('handleDoubleClick', () => {
  let overlay: HTMLElement;

  beforeEach(() => {
    store.dispatch(stopTextEdit());
    overlay = createOverlay('Hi');
  });

  afterEach(() => {
    overlay.remove();
  });

  it('should select the whole word (not just a collapsed caret) when the double-click lands on the path within tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const anchorIndexRef = createAnchorRef();

    anchorIndexRef.current = 5;

    // before
    handleDoubleClick(canvas, doubleClickEvent(NEAR_RIGHT.x, NEAR_RIGHT.y, canvas), store.dispatch, anchorIndexRef);

    // result — "Hi" is a single word, so the whole 2-character content is selected
    expect(document.activeElement).toBe(overlay);
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe(2);
    expect(anchorIndexRef.current).toBeNull();
  });

  it('should do nothing when the double-click misses the path outside hit tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const anchorIndexRef = createAnchorRef();

    // before
    handleDoubleClick(canvas, doubleClickEvent(FAR.x, FAR.y, canvas), store.dispatch, anchorIndexRef);

    // result
    expect(document.activeElement).not.toBe(overlay);
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe(0);
  });

  it('should ignore double-clicks that land outside the canvas and the editing overlay', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const outsideElement = document.createElement('div');

    document.body.appendChild(outsideElement);

    const anchorIndexRef = createAnchorRef();

    // before
    handleDoubleClick(canvas, doubleClickEvent(NEAR_RIGHT.x, NEAR_RIGHT.y, outsideElement), store.dispatch, anchorIndexRef);

    // result
    expect(document.activeElement).not.toBe(overlay);

    // after
    outsideElement.remove();
  });
});
