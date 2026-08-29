import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';

// components
import TextEditOverlay from './TextEditOverlay';

// store
import designReducer, { startTextEdit } from 'store/design/slice';
import { TDesignState } from 'store/design/types';
import { selectSelectedIds } from 'store/design/selectors';

// types
import { NodeType } from 'types/design/enums';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const renderWithStore = (store: EnhancedStore<{ design: TDesignState }>): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TextEditOverlay />
    </Provider>,
  );

describe('TextEditOverlay snapshots', () => {
  it('should render nothing when there is no text box being edited', () => {
    // before
    const { asFragment } = renderWithStore(createTestStore());

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('TextEditOverlay behaviors', () => {
  it('should render a focused, positioned editable box once a text box starts editing', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }));

    // before
    const { container } = renderWithStore(store);

    // find
    const element = container.querySelector('[contenteditable="true"]');

    // result
    expect(element).toHaveStyle({ left: '10px', top: '10px', width: '100px' });
    expect(element).toHaveFocus();
  });

  it('should stay axis-aligned regardless of the node rotation/mirror — the DOM box is an invisible input surface only, not the visible representation', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { flipX: true, flipY: true, height: 20, rotation: 30, width: 100, x: 10, y: 10 }, id: 'node-1' }));

    // before
    const { container } = renderWithStore(store);

    // find
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    // result — canvas-drawn glyphs/caret/selection (drawEditingCaretAndSelection.ts) carry the real
    expect(element.style.transform).toBe('');
    expect(element.style.caretColor).toBe('transparent');
  });

  it('should dispatch the live typed content while editing', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    element.textContent = 'hi';

    // action
    fireEvent.input(element);

    // result
    expect(store.getState().design.editingTextContent).toBe('hi');
  });

  it('should stop keydown events from bubbling up to window-level shortcut listeners', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;
    const windowKeyDown = vi.fn();

    window.addEventListener('keydown', windowKeyDown);

    // action
    fireEvent.keyDown(element, { code: 'KeyR' });

    // result
    expect(windowKeyDown).not.toHaveBeenCalled();

    // after
    window.removeEventListener('keydown', windowKeyDown);
  });

  it('should stop editing when the editable box loses focus', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    element.textContent = 'hello world';

    // action
    fireEvent.blur(element);

    // result
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should pre-populate and select all the existing content when editing an existing node', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      startTextEdit({
        box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
        content: 'hello world',
        id: 'node-1',
      }),
    );

    // before
    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    // result
    expect(element.textContent).toBe('hello world');
    expect(window.getSelection()?.toString()).toBe('hello world');
  });

  it('should select the whole multi-line content when re-entering edit on an existing node, not just the first line', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      startTextEdit({
        box: { flipX: false, flipY: false, height: 60, rotation: 0, width: 100, x: 10, y: 10 },
        content: 'hi\nthere\nyou',
        id: 'node-1',
      }),
    );

    // before — this drives the canvas-rendered highlight the user actually sees, since the overlay's
    // own text/caret are styled transparent; jsdom's Selection.toString() doesn't serialize <br> as
    // \n the way a real browser's does, so the redux selection is the meaningful assertion here
    renderWithStore(store);

    // result
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe('hi\nthere\nyou'.length);
  });

  it('should update the existing node in place on blur, instead of adding a new one', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      startTextEdit({
        box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
        content: 'hello',
        id: 'node-1',
      }),
    );

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    element.textContent = 'goodbye';

    // action
    fireEvent.blur(element);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].rootOrder).toHaveLength(0);
    expect(store.getState().design.editingTextBox).toBeNull();
  });

  it('should commit and select the newly created node when Escape is pressed while drawing fresh text, instead of deselecting it', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    element.textContent = 'hello';
    fireEvent.input(element);

    // action
    fireEvent.keyDown(element, { key: 'Escape' });

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(design.editingTextBox).toBeNull();
    expect(page.rootOrder).toHaveLength(1);
    expect(page.nodes[page.rootOrder[0]]).toMatchObject({ content: 'hello', type: NodeType.text });
    expect(page.selectedIds).toEqual([page.rootOrder[0]]);
  });

  it('should discard a fresh box with no content when Escape is pressed, same as blurring it away empty', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startTextEdit({ box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 } }));

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    // action
    fireEvent.keyDown(element, { key: 'Escape' });

    // result
    const { design } = store.getState();
    const page = design.pages[design.activePageId];

    expect(design.editingTextBox).toBeNull();
    expect(page.rootOrder).toHaveLength(0);
    expect(page.selectedIds).toEqual([]);
  });

  it('should keep the existing node selected when Escape is pressed while re-editing it, instead of deselecting it', () => {
    // mock
    const store = createTestStore();

    store.dispatch(
      startTextEdit({
        box: { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 10, y: 10 },
        content: 'hello',
        id: 'node-1',
      }),
    );

    const { container } = renderWithStore(store);
    const element = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    // action
    fireEvent.keyDown(element, { key: 'Escape' });

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['node-1']);
  });
});
