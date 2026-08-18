import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';

// components
import CommentDraftInput from './CommentDraftInput';

// store
import designReducer, { setViewport, startCommentDraft } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const renderWithStore = (store: EnhancedStore<{ design: TDesignState }>): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CommentDraftInput x={12} y={34} />
    </Provider>,
  );

describe('CommentDraftInput behaviors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show the placeholder while empty', () => {
    // before
    const { getByText } = renderWithStore(createTestStore());

    // result
    expect(getByText('Leave a comment')).toBeInTheDocument();
  });

  it('should hide the placeholder once text is typed', () => {
    // before
    const { container, queryByText } = renderWithStore(createTestStore());
    const input = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    input.textContent = 'hello';

    // action
    fireEvent.input(input);

    // result
    expect(queryByText('Leave a comment')).not.toBeInTheDocument();
  });

  it('should submit the comment on Ctrl+Enter', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { container } = renderWithStore(store);
    const input = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    input.textContent = 'hello';
    fireEvent.input(input);

    // action
    fireEvent.keyDown(input, { ctrlKey: true, key: 'Enter' });

    // result
    const [id] = Object.keys(store.getState().design.comments);

    expect(store.getState().design.comments[id]).toMatchObject({ content: 'hello' });
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  it('should submit the comment when the submit button is clicked', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { container } = renderWithStore(store);
    const input = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    input.textContent = 'hello';
    fireEvent.input(input);

    // action
    fireEvent.click(container.querySelector('[class*="__button"]') as HTMLButtonElement);

    // result
    expect(Object.values(store.getState().design.comments)).toHaveLength(1);
  });

  it('should keep a constant pixel size regardless of the canvas zoom, since x/y are already world-to-screen', () => {
    // mock
    const zoomedOutStore = createTestStore();
    const zoomedInStore = createTestStore();

    zoomedOutStore.dispatch(setViewport({ x: 0, y: 0, zoom: 0.5 }));
    zoomedInStore.dispatch(setViewport({ x: 0, y: 0, zoom: 2 }));

    // before
    const zoomedOut = renderWithStore(zoomedOutStore);
    const zoomedIn = renderWithStore(zoomedInStore);

    // result
    expect((zoomedOut.container.querySelector('[class*="CommentDraftInput"]') as HTMLDivElement).style.transform).toBe('');
    expect((zoomedIn.container.querySelector('[class*="CommentDraftInput"]') as HTMLDivElement).style.transform).toBe('');
  });

  it('should cancel the draft on an outside click', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    renderWithStore(store);
    vi.advanceTimersByTime(0);

    // action
    fireEvent.pointerDown(document.body);

    // result
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  it('should wiggle instead of cancelling on the first outside click with unsaved content', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { container } = renderWithStore(store);
    const input = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    input.textContent = 'hello';
    fireEvent.input(input);
    vi.advanceTimersByTime(0);

    // action
    fireEvent.pointerDown(document.body);

    // result
    const content = container.querySelector('[class*="__content"]') as HTMLDivElement;

    expect(content.className).toMatch(/__content--animation/);
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });
  });

  it('should cancel the draft on a second outside click after already having wiggled once', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { container } = renderWithStore(store);
    const input = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    input.textContent = 'hello';
    fireEvent.input(input);
    vi.advanceTimersByTime(0);
    fireEvent.pointerDown(document.body);
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });

    // action
    vi.advanceTimersByTime(0);
    fireEvent.pointerDown(document.body);

    // result
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  it('should clear the bounce animation on refocus', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { container } = renderWithStore(store);
    const input = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    input.textContent = 'hello';
    fireEvent.input(input);
    vi.advanceTimersByTime(0);
    fireEvent.pointerDown(document.body);

    // action
    fireEvent.focus(input);

    // result
    const content = container.querySelector('[class*="__content"]') as HTMLDivElement;

    expect(content.className).not.toMatch(/__content--animation/);
  });

  it('should cancel the draft on Escape', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { container } = renderWithStore(store);
    const input = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    input.focus();

    // action
    fireEvent.keyDown(input, { key: 'Escape' });

    // result
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  it('should stop keydown events from bubbling up to window-level shortcut listeners', () => {
    // mock
    const store = createTestStore();
    const windowKeyDown = vi.fn();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));
    window.addEventListener('keydown', windowKeyDown);

    // before
    const { container } = renderWithStore(store);
    const input = container.querySelector('[contenteditable="true"]') as HTMLDivElement;

    // action
    fireEvent.keyDown(input, { key: 'a' });

    // result
    expect(windowKeyDown).not.toHaveBeenCalled();

    // after
    window.removeEventListener('keydown', windowKeyDown);
  });
});
