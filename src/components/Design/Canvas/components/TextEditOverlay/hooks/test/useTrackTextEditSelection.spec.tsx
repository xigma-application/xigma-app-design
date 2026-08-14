import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';
import { SyntheticEvent } from 'react';

// hooks
import { useTrackTextEditSelection } from '../useTrackTextEditSelection';

// store
import designReducer from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createSelectEvent = (textNode: Text, start: number, end: number): SyntheticEvent<HTMLDivElement> => {
  const currentTarget = textNode.parentElement as HTMLDivElement;
  const range = document.createRange();

  range.setStart(textNode, start);
  range.setEnd(textNode, end);

  const selection = window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(range);

  return { currentTarget } as SyntheticEvent<HTMLDivElement>;
};

describe('useTrackTextEditSelection behaviors', () => {
  it("should dispatch the current native selection's offsets", () => {
    // mock
    const store = createTestStore();
    const element = document.createElement('div');
    const textNode = document.createTextNode('hello world');

    element.appendChild(textNode);
    document.body.appendChild(element);

    // before
    const { result } = renderHook(() => useTrackTextEditSelection(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    // action
    result.current(createSelectEvent(textNode, 2, 7));

    // result
    expect(store.getState().design.editingSelectionStart).toBe(2);
    expect(store.getState().design.editingSelectionEnd).toBe(7);

    // after
    document.body.removeChild(element);
  });
});
