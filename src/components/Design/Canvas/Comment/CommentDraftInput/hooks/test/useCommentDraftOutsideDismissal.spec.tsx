import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { RefObject } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useCommentDraftOutsideDismissal } from '../useCommentDraftOutsideDismissal';

// store
import designReducer, { startCommentDraft } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createContentRef = (): RefObject<HTMLElement | null> => ({ current: document.createElement('div') });

const dispatchOutsidePointerDown = (): void => {
  act(() => {
    vi.advanceTimersByTime(0);
  });
  act(() => {
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
  });
};

const renderDismissal = (
  store: EnhancedStore<{ design: TDesignState }>,
  contentRef: RefObject<HTMLElement | null>,
  value: string,
): ReturnType<typeof renderHook<{ animationActive: boolean; onFocus: () => void }, unknown>> =>
  renderHook(() => useCommentDraftOutsideDismissal(contentRef, value), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

describe('useCommentDraftOutsideDismissal behaviors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should cancel the draft on an outside click when the value is empty', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    renderDismissal(store, createContentRef(), '');

    // action
    dispatchOutsidePointerDown();

    // result
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  it('should wiggle instead of cancelling on the first outside click when the value is non-empty', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { result } = renderDismissal(store, createContentRef(), 'hello');

    // action
    dispatchOutsidePointerDown();

    // result
    expect(result.current.animationActive).toBe(true);
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });
  });

  it('should not react to the click that just opened the draft (same tick as mount)', () => {
    // mock — the pointerdown that causes CommentDraftInput to mount must not immediately
    // dismiss it, even though that same click is, by definition, "outside" the new element
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    renderDismissal(store, createContentRef(), '');

    // action — no timer advance: this is the same tick the component mounted in
    act(() => {
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    // result
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });
  });

  it('should cancel the draft on a second outside click after already having wiggled once', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    const contentRef = createContentRef();

    renderDismissal(store, contentRef, 'hello');

    dispatchOutsidePointerDown();
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });

    // action — a second, separate outside click
    dispatchOutsidePointerDown();

    // result
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });

  it('should not react to a middle-mouse-button click used for panning the canvas', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    renderDismissal(store, createContentRef(), '');

    act(() => {
      vi.advanceTimersByTime(0);
    });

    // action
    act(() => {
      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 1 }));
    });

    // result
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });
  });

  it('should not react to a click inside the content element', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    const contentRef = createContentRef();

    document.body.appendChild(contentRef.current as HTMLElement);

    renderDismissal(store, contentRef, 'hello');

    act(() => {
      vi.advanceTimersByTime(0);
    });

    // action
    act(() => {
      contentRef.current?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    });

    // result
    expect(store.getState().design.commentDraftPosition).toEqual({ x: 10, y: 20 });

    // after
    contentRef.current?.remove();
  });

  it('should reset the warning and animation state on focus', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { result } = renderDismissal(store, createContentRef(), 'hello');

    dispatchOutsidePointerDown();
    expect(result.current.animationActive).toBe(true);

    // action
    act(() => {
      result.current.onFocus();
    });

    // result
    expect(result.current.animationActive).toBe(false);
  });
});
