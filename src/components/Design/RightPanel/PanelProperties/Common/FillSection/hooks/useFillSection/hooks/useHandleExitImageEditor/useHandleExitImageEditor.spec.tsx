import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useHandleExitImageEditor } from './useHandleExitImageEditor';

// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useHandleExitImageEditor', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should clear the image editor when called', () => {
    // mock
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'node-1', paintIndex: 0 }));

    // before
    const { result } = renderHook(() => useHandleExitImageEditor(), { wrapper });

    // action
    result.current();

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });
});
