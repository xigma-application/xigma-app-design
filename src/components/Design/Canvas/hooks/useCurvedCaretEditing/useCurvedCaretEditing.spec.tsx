import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RefObject } from 'react';

// core
import ClassNamesProvider from 'components/Design/core/ClassNamesProvider/ClassNamesProvider';

// hooks
import { createCanvasRefs } from '../useCanvasRefs/createCanvasRefs';
import { useCurvedCaretEditing } from './useCurvedCaretEditing';

// store
import { addNode, setSelection, startTextEdit, stopTextEdit } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
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

const RIGHT = { x: 1200, y: 1100 };
const NEAR_RIGHT = { x: 1200, y: 1108 };
const BOTTOM = { x: 1100, y: 1200 };
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

const doubleClickEvent = (x: number, y: number): MouseEvent =>
  new MouseEvent('dblclick', { bubbles: true, button: 0, clientX: x, clientY: y });

const renderCurvedCaretEditing = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  renderHook(() => useCurvedCaretEditing(createCanvasRefs({ canvasRef })), {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <ClassNamesProvider>{children}</ClassNamesProvider>
      </Provider>
    ),
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
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', NEAR_RIGHT.x, NEAR_RIGHT.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(1);
    expect(design.editingSelectionEnd).toBe(1);
    expect(document.activeElement).toBe(overlay);
  });

  it('should select the whole word (not just a collapsed caret) when double-clicking on the path within tolerance', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(doubleClickEvent(NEAR_RIGHT.x, NEAR_RIGHT.y));
    });

    // result — "Hi" is a single word, so the whole 2-character content is selected
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(2);
    expect(document.activeElement).toBe(overlay);
  });

  it('should extend the selection from the anchor index while dragging', () => {
    // mock
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', NEAR_RIGHT.x, NEAR_RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result
    const { design } = store.getState();

    expect(design.editingSelectionStart).toBe(1);
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

  it('should drag the path-offset handle on the live editing box while a path-text node is still being drawn for the first time', () => {
    // mock — no committed node exists yet, matching startTextEdit called with no id
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result — pathStartOffset moved toward BOTTOM (a quarter turn) on the editing box
    expect(store.getState().design.editingTextBox).toMatchObject({ pathStartOffset: expect.closeTo(0.25, 2) });
  });

  it('should treat a caret-extend move as a miss once the editing session ends mid-gesture', () => {
    // mock — the initial click lands away from the offset handle so it arms a caret drag instead
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi' }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action — the effect's cleanup for the now-stale listener is deferred until this batch commits
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', NEAR_RIGHT.x, NEAR_RIGHT.y));
      store.dispatch(stopTextEdit());
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should drag the path-offset handle instead of placing a caret when the click lands on it', () => {
    // mock — a real, selected path-text node whose committed box matches CIRCLE_BOX, so the
    store.dispatch(
      addNode({
        content: 'Hi',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: CIRCLE_BOX.height,
        name: 'Text',
        parentId: null,
        pathFlip: false,
        pathId: 'ellipse-1',
        pathStartOffset: 0,
        rotation: 0,
        type: NodeType.text,
        width: CIRCLE_BOX.width,
        x: CIRCLE_BOX.x,
        y: CIRCLE_BOX.y,
      }),
    );

    const { rootOrder } = store.getState().design;
    const nodeId = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([nodeId]));
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi', id: nodeId }));
    overlay.focus(); // simulate an already-active edit session, as if the user was mid-typing

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result — pathStartOffset moved toward BOTTOM (a quarter turn), on both the committed node and
    const { design } = store.getState();

    expect(design.nodes[nodeId]).toMatchObject({ pathStartOffset: expect.closeTo(0.25, 2) });
    expect(design.editingTextBox).toMatchObject({ pathStartOffset: expect.closeTo(0.25, 2) });
    expect(design.editingSelectionStart).toBe(0);
    expect(design.editingSelectionEnd).toBe(2);
    expect(document.activeElement).toBe(overlay);
  });

  it('should stop dragging the path-offset handle once the pointer is released', () => {
    // mock
    store.dispatch(
      addNode({
        content: 'Hi',
        fill: '#ffffff',
        flipX: false,
        flipY: false,
        fontFamily: 'Inter',
        fontSize: 14,
        height: CIRCLE_BOX.height,
        name: 'Text',
        parentId: null,
        pathFlip: false,
        pathId: 'ellipse-1',
        pathStartOffset: 0,
        rotation: 0,
        type: NodeType.text,
        width: CIRCLE_BOX.width,
        x: CIRCLE_BOX.x,
        y: CIRCLE_BOX.y,
      }),
    );

    const { rootOrder } = store.getState().design;
    const nodeId = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([nodeId]));
    store.dispatch(startTextEdit({ box: CIRCLE_BOX, content: 'Hi', id: nodeId }));

    // before
    renderCurvedCaretEditing(canvasRef);

    // action
    act(() => {
      canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', RIGHT.x, RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointerup', RIGHT.x, RIGHT.y));
      canvasRef.current?.dispatchEvent(pointerEvent('pointermove', BOTTOM.x, BOTTOM.y));
    });

    // result — released before the move, so pathStartOffset never left its starting value
    expect(store.getState().design.nodes[nodeId]).toMatchObject({ pathStartOffset: 0 });
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
