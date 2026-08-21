import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { MouseEvent } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSubmitCommentDraft } from '../useSubmitCommentDraft';

// store
import designReducer, { startCommentDraft } from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const mockMouseEvent = (): MouseEvent => ({ preventDefault: vi.fn() }) as unknown as MouseEvent;

describe('useSubmitCommentDraft behaviors', () => {
  it('should add a comment at the draft position when the value is non-empty', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { result } = renderHook(() => useSubmitCommentDraft('hello'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current.onClick();

    // result
    const [id] = Object.keys(store.getState().design.comments);

    expect(store.getState().design.comments[id]).toMatchObject({ content: 'hello' });
  });

  it('should not add a comment when the value is empty', () => {
    // mock
    const store = createTestStore();

    store.dispatch(startCommentDraft({ x: 10, y: 20 }));

    // before
    const { result } = renderHook(() => useSubmitCommentDraft(''), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current.onClick();

    // result
    expect(store.getState().design.comments).toEqual({});
  });

  it('should prevent the default mousedown action so the button does not steal focus', () => {
    // mock
    const store = createTestStore();

    // before
    const { result } = renderHook(() => useSubmitCommentDraft('hello'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const event = mockMouseEvent();

    // action
    result.current.onMouseDown(event);

    // result
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
