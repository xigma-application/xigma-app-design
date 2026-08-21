import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { KeyboardEvent } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useCommentDraftKeyDown } from '../useCommentDraftKeyDown';

// store
import designReducer, { startCommentDraft } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createKeyEvent = (key: string, options: Partial<{ ctrlKey: boolean; metaKey: boolean }> = {}): KeyboardEvent<HTMLDivElement> => {
  const currentTarget = document.createElement('div');

  currentTarget.blur = vi.fn();

  return {
    ctrlKey: false,
    currentTarget,
    key,
    metaKey: false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...options,
  } as unknown as KeyboardEvent<HTMLDivElement>;
};

const renderCommentDraftKeyDown = (
  store: EnhancedStore<{ design: TDesignState }>,
  onSubmit: () => void,
): ((event: KeyboardEvent<HTMLDivElement>) => void) => {
  const { result } = renderHook(() => useCommentDraftKeyDown(onSubmit), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return result.current;
};

describe('useCommentDraftKeyDown behaviors', () => {
  it('should always stop propagation so the global tool-reset shortcut is not also triggered', () => {
    // mock
    const onKeyDown = renderCommentDraftKeyDown(createTestStore(), vi.fn());
    const event = createKeyEvent('a');

    // action
    onKeyDown(event);

    // result
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should submit on Ctrl+Enter', () => {
    // mock
    const onSubmit = vi.fn();
    const onKeyDown = renderCommentDraftKeyDown(createTestStore(), onSubmit);
    const event = createKeyEvent('Enter', { ctrlKey: true });

    // action
    onKeyDown(event);

    // result
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should submit on Cmd+Enter', () => {
    // mock
    const onSubmit = vi.fn();
    const onKeyDown = renderCommentDraftKeyDown(createTestStore(), onSubmit);
    const event = createKeyEvent('Enter', { metaKey: true });

    // action
    onKeyDown(event);

    // result
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should not submit on a plain Enter (no modifier)', () => {
    // mock
    const onSubmit = vi.fn();
    const onKeyDown = renderCommentDraftKeyDown(createTestStore(), onSubmit);
    const event = createKeyEvent('Enter');

    // action
    onKeyDown(event);

    // result
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should blur the input and cancel the draft on Escape', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    const onKeyDown = renderCommentDraftKeyDown(store, vi.fn());
    const event = createKeyEvent('Escape');

    // action
    onKeyDown(event);

    // result
    expect(event.currentTarget.blur).toHaveBeenCalled();
    expect(store.getState().design.commentDraftPosition).toBeNull();
  });
});
