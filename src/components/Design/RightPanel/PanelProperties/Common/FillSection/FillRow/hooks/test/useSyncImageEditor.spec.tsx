import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSyncImageEditor } from '../useSyncImageEditor';

// store
import { selectImageEditor } from 'store/design/selectors';
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSyncImageEditor', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should set the image editor to position mode when the picker is open on the image tab with a nodeId', () => {
    // before
    renderHook(() => useSyncImageEditor('node-1', 2, true, true), { wrapper });

    // result
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'position', nodeId: 'node-1', paintIndex: 2 });
  });

  it('should not clear the image editor when only the picker closes while still on the Image tab (e.g. starting a canvas resize)', () => {
    // before — mount with the picker open, which seeds position mode
    const { rerender } = renderHook(({ isPickerOpen }) => useSyncImageEditor('node-1', 0, isPickerOpen, true), {
      initialProps: { isPickerOpen: true },
      wrapper,
    });

    // mock — a resize arming on canvas flips the mode to crop independently of this hook
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 }));

    // action — the picker then auto-closes (e.g. Radix's outside-click dismissal on that same canvas click)
    rerender({ isPickerOpen: false });

    // result — the crop-mode state survives, since the node stayed on the Image tab throughout
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 });
  });

  it('should clear the image editor when the image tab is not active', () => {
    // before
    renderHook(() => useSyncImageEditor('node-1', 0, true, false), { wrapper });

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should clear the image editor when there is no nodeId', () => {
    // before
    renderHook(() => useSyncImageEditor(undefined, 0, true, true), { wrapper });

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should clear the image editor on unmount', () => {
    // before
    const { unmount } = renderHook(() => useSyncImageEditor('node-1', 0, true, true), { wrapper });

    // action
    unmount();

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });
});
