import { RefObject } from 'react';

// store
import { startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { handleDoubleClick } from '../handleDoubleClick';

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

  it('should select the whole word (not just a collapsed caret) when the double-click lands within tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const anchorIndexRef = createAnchorRef();

    anchorIndexRef.current = 5;

    // before
    handleDoubleClick(canvas, doubleClickEvent(START.x, START.y, canvas), store.dispatch, anchorIndexRef);

    // result — "Hi" is a single word, so the whole 2-character content is selected
    expect(document.activeElement).toBe(overlay);
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe(2);
    expect(anchorIndexRef.current).toBeNull();
  });

  it('should do nothing when the double-click misses outside hit tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

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
    store.dispatch(startTextEdit({ box: ROTATED_BOX, content: 'Hi' }));

    const canvas = createCanvas();
    const outsideElement = document.createElement('div');

    document.body.appendChild(outsideElement);

    const anchorIndexRef = createAnchorRef();

    // before
    handleDoubleClick(canvas, doubleClickEvent(START.x, START.y, outsideElement), store.dispatch, anchorIndexRef);

    // result
    expect(document.activeElement).not.toBe(overlay);

    // after
    outsideElement.remove();
  });
});
