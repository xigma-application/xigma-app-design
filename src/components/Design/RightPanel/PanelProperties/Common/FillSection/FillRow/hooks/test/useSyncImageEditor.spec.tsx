import { ReactNode, StrictMode } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSyncImageEditor } from '../useSyncImageEditor';

// store
import { selectImageEditor, selectImageFillPickerFocus } from 'store/design/selectors';
import { setImageEditor, setImageFillPickerFocus } from 'store/design/slice';
import { store } from 'store';

// types
import { TImageEditorMode } from 'store/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const strictModeWrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <StrictMode>
    <Provider store={store}>{children}</Provider>
  </StrictMode>
);

describe('useSyncImageEditor', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
    store.dispatch(setImageFillPickerFocus(null));
  });

  it('should set the image editor to position mode when the picker is open on the image tab with a nodeId', () => {
    // before
    renderHook(() => useSyncImageEditor('node-1', 2, true, true, 'position', false), { wrapper });

    // result
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'position', nodeId: 'node-1', paintIndex: 2 });
  });

  it('should record the fill-picker focus alongside the image editor, so it can be restored after an external close', () => {
    // before
    renderHook(() => useSyncImageEditor('node-1', 2, true, true, 'position', false), { wrapper });

    // result
    expect(selectImageFillPickerFocus(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 2 });
  });

  it('should not clear the image editor when only the picker closes while still on the Image tab (e.g. starting a canvas resize)', () => {
    // before — mount with the picker open, which seeds position mode
    const { rerender } = renderHook(({ isPickerOpen }) => useSyncImageEditor('node-1', 0, isPickerOpen, true, 'position', false), {
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
    renderHook(() => useSyncImageEditor('node-1', 0, true, false, 'position', false), { wrapper });

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should clear the image editor when there is no nodeId', () => {
    // before
    renderHook(() => useSyncImageEditor(undefined, 0, true, true, 'position', false), { wrapper });

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should clear the image editor on unmount', () => {
    // before
    const { unmount } = renderHook(() => useSyncImageEditor('node-1', 0, true, true, 'position', false), { wrapper });

    // action
    unmount();

    // result
    expect(selectImageEditor(store.getState())).toBeNull();
  });

  it('should clear the fill-picker focus when the picker genuinely closes (leaves the Image tab)', () => {
    // before
    const { rerender } = renderHook(({ isImageTabActive }) => useSyncImageEditor('node-1', 0, true, isImageTabActive, 'position', false), {
      initialProps: { isImageTabActive: true },
      wrapper,
    });

    // action
    rerender({ isImageTabActive: false });

    // result
    expect(selectImageFillPickerFocus(store.getState())).toBeNull();
  });

  it('should clear the fill-picker focus on unmount when the node is no longer selected', () => {
    // before
    const { unmount } = renderHook(() => useSyncImageEditor('node-1', 0, true, true, 'position', false), { wrapper });

    // action
    unmount();

    // result
    expect(selectImageFillPickerFocus(store.getState())).toBeNull();
  });

  it('should re-enter crop mode immediately when reopening the picker on an image that already has a stored crop', () => {
    // before
    renderHook(() => useSyncImageEditor('node-1', 0, true, true, 'crop', false), { wrapper });

    // result
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 });
  });

  it('should enter tile mode immediately when reopening the picker on a tile-scaled image', () => {
    // before
    renderHook(() => useSyncImageEditor('node-1', 0, true, true, 'tile', false), { wrapper });

    // result
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'tile', nodeId: 'node-1', paintIndex: 0 });
  });

  it('should exit tile mode when the picker closes, same as crop or position mode', () => {
    // before
    const { rerender } = renderHook(({ isImageTabActive }) => useSyncImageEditor('node-1', 0, true, isImageTabActive, 'tile', false), {
      initialProps: { isImageTabActive: true },
      wrapper,
    });

    expect(selectImageEditor(store.getState())).toEqual({ mode: 'tile', nodeId: 'node-1', paintIndex: 0 });

    // action — leaves the Image tab, a genuine picker close
    rerender({ isImageTabActive: false });

    // result — tile mode requires the picker open, exactly like crop mode
    expect(selectImageEditor(store.getState())).toBeNull();
    expect(selectImageFillPickerFocus(store.getState())).toBeNull();
  });

  it('should not re-dispatch position mode when a crop is committed mid-drag while the picker stays open', () => {
    // before — mount already in crop mode (as if a resize/drag already started it)
    const { rerender } = renderHook(({ initialMode }) => useSyncImageEditor('node-1', 0, true, true, initialMode, false), {
      initialProps: { initialMode: 'position' as TImageEditorMode },
      wrapper,
    });

    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0, selectedTarget: 'image' }));

    // action — initialMode flips to crop once the drag commits paint.crop, without isPickerOpen/isImageTabActive changing
    rerender({ initialMode: 'crop' });

    // result — selectedTarget survives; the effect did not re-fire and overwrite it
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'crop', nodeId: 'node-1', paintIndex: 0, selectedTarget: 'image' });
  });

  it('should skip arming the image editor on mount when skipInitialArm is set, while still recording the fill-picker focus (restoring a picker that was visually reopened after the editor was closed externally, without re-arming crop mode on canvas)', () => {
    // before — mounts already open+image-tab-active, as when a restored FillRow seeds its own state from the focus marker
    renderHook(() => useSyncImageEditor('node-1', 0, true, true, 'position', true), { wrapper });

    // result — the editor itself stays untouched (still null, as left by whatever closed it), but the focus marker is (re)recorded
    expect(selectImageEditor(store.getState())).toBeNull();
    expect(selectImageFillPickerFocus(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0 });
  });

  it('should only skip arming while the restored session stays open: a later genuine close-then-reopen re-arms normally', () => {
    // before
    const { rerender } = renderHook(({ isImageTabActive }) => useSyncImageEditor('node-1', 0, true, isImageTabActive, 'position', true), {
      initialProps: { isImageTabActive: true },
      wrapper,
    });

    expect(selectImageEditor(store.getState())).toBeNull();

    // action — user leaves the Image tab (a genuine close), then comes back to it
    rerender({ isImageTabActive: false });
    rerender({ isImageTabActive: true });

    // result — this second open is a real transition, so the skip window (closed by the real close) no longer applies
    expect(selectImageEditor(store.getState())).toEqual({ mode: 'position', nodeId: 'node-1', paintIndex: 0 });
  });

  it('should still skip arming under StrictMode’s dev-mode mount→cleanup→remount replay (regression: a plain one-shot ref got silently spent by the phantom first pass, so the real, kept effect run armed anyway)', () => {
    // before — StrictMode double-invokes effects on mount; a naive "consume the skip flag" ref
    // would have it already spent by the phantom pass before the real one ever runs
    renderHook(() => useSyncImageEditor('node-1', 0, true, true, 'position', true), { wrapper: strictModeWrapper });

    // result — still never armed
    expect(selectImageEditor(store.getState())).toBeNull();
    expect(selectImageFillPickerFocus(store.getState())).toEqual({ nodeId: 'node-1', paintIndex: 0 });
  });
});
