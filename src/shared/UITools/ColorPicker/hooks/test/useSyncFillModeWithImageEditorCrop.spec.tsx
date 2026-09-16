import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';

// hooks
import { useSyncFillModeWithImageEditorCrop } from '../useSyncFillModeWithImageEditorCrop';

// store
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

const wrapper: FC<{ children: ReactNode }> = ({ children }) => <Provider store={store}>{children}</Provider>;

describe('useSyncFillModeWithImageEditorCrop', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should set the fill mode to crop when the image editor enters crop mode while the Image tab is active', () => {
    // before
    const setFillMode = vi.fn();
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'node-1', paintIndex: 0 }));

    // action
    renderHook(() => useSyncFillModeWithImageEditorCrop(true, setFillMode), { wrapper });
    act(() => {
      store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 }));
    });

    // result
    expect(setFillMode).toHaveBeenCalledWith('crop');
  });

  it('should not set the fill mode while the image editor is still in position mode', () => {
    // before
    const setFillMode = vi.fn();
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'node-1', paintIndex: 0 }));

    // action
    renderHook(() => useSyncFillModeWithImageEditorCrop(true, setFillMode), { wrapper });

    // result
    expect(setFillMode).not.toHaveBeenCalled();
  });

  it('should not set the fill mode when the Image tab is not active, even if the editor is in crop mode', () => {
    // before
    const setFillMode = vi.fn();
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 }));

    // action
    renderHook(() => useSyncFillModeWithImageEditorCrop(false, setFillMode), { wrapper });

    // result
    expect(setFillMode).not.toHaveBeenCalled();
  });
});
