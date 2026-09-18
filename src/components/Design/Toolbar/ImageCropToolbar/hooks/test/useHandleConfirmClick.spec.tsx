import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useHandleConfirmClick } from '../useHandleConfirmClick';

// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

const renderUseHandleConfirmClick = (): ReturnType<typeof renderHook<ReturnType<typeof useHandleConfirmClick>, unknown>> =>
  renderHook(() => useHandleConfirmClick(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useHandleConfirmClick', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should exit the image editor when clicked', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 }));

    const { result } = renderUseHandleConfirmClick();

    // before
    act(() => result.current());

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });
});
