import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { InputEvent } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useTextEditInput } from '../useTextEditInput';

// store
import designReducer from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createInputEvent = (html: string): InputEvent<HTMLDivElement> => {
  const currentTarget = document.createElement('div');

  currentTarget.innerHTML = html;

  return { currentTarget } as InputEvent<HTMLDivElement>;
};

describe('useTextEditInput behaviors', () => {
  it('should dispatch the live typed content', () => {
    // mock
    const store = createTestStore();

    // before
    const { result } = renderHook(() => useTextEditInput(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createInputEvent('hello'));

    // result
    expect(store.getState().design.editingTextContent).toBe('hello');
  });

  it('should collapse a blank line (Enter twice) to a single newline, not the browser doubled one', () => {
    // mock
    const store = createTestStore();

    // before
    const { result } = renderHook(() => useTextEditInput(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action — chrome represents the blank line as a <div> containing only a <br>
    result.current(createInputEvent('first<div><br></div><div>second</div>'));

    // result
    expect(store.getState().design.editingTextContent).toBe('first\n\nsecond');
  });
});
