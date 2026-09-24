import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

// hooks
import { useStrokeBrushPicker } from '../useStrokeBrushPicker';
import { StrokeSettingsDockedPanelContext } from '../../../StrokeSettingsDockedPanelContext';

const createWrapper =
  (setDockedPanel: TFunc<[ReactNode]>) =>
  ({ children }: { children: ReactNode }): ReactNode => (
    <StrokeSettingsDockedPanelContext.Provider value={setDockedPanel}>{children}</StrokeSettingsDockedPanelContext.Provider>
  );

describe('useStrokeBrushPicker', () => {
  it('should dock the picker on toggle, commit a brush picked through it, and close', () => {
    // mock
    const setDockedPanel = vi.fn();
    const onBrushCommit = vi.fn();

    // before
    const { result } = renderHook(() => useStrokeBrushPicker('heist', vi.fn(), vi.fn(), onBrushCommit), {
      wrapper: createWrapper(setDockedPanel),
    });

    // result
    expect(result.current.isPickerOpen).toBe(false);

    // action
    act(() => result.current.onTogglePicker());

    // result
    expect(result.current.isPickerOpen).toBe(true);
    expect(setDockedPanel).toHaveBeenCalledWith(expect.anything());

    // action
    act(() => setDockedPanel.mock.calls[0][0].props.onSelect('noir'));

    // result
    expect(onBrushCommit).toHaveBeenCalledWith('noir');
    expect(result.current.isPickerOpen).toBe(false);
    expect(setDockedPanel).toHaveBeenLastCalledWith(null);
  });

  it('should close the picker on toggle when already open, reverting any preview', () => {
    // mock
    const setDockedPanel = vi.fn();
    const onBrushRevert = vi.fn();

    // before
    const { result } = renderHook(() => useStrokeBrushPicker('heist', vi.fn(), onBrushRevert, vi.fn()), {
      wrapper: createWrapper(setDockedPanel),
    });

    // action
    act(() => result.current.onTogglePicker());
    act(() => result.current.onTogglePicker());

    // result
    expect(result.current.isPickerOpen).toBe(false);
    expect(onBrushRevert).toHaveBeenCalledTimes(1);
    expect(setDockedPanel).toHaveBeenLastCalledWith(null);
  });

  it('should preview a brush on hover and revert it once the hover ends without a click', () => {
    // mock
    const setDockedPanel = vi.fn();
    const onBrushPreview = vi.fn();
    const onBrushRevert = vi.fn();

    // before
    const { result } = renderHook(() => useStrokeBrushPicker('heist', onBrushPreview, onBrushRevert, vi.fn()), {
      wrapper: createWrapper(setDockedPanel),
    });

    act(() => result.current.onTogglePicker());

    const dockedPicker = setDockedPanel.mock.calls[0][0];

    // action
    act(() => dockedPicker.props.onOptionHoverStart('noir'));

    // result
    expect(onBrushPreview).toHaveBeenLastCalledWith('noir');

    // action
    act(() => dockedPicker.props.onOptionHoverEnd());

    // result
    expect(onBrushRevert).toHaveBeenCalledTimes(1);
    expect(result.current.isPickerOpen).toBe(true);
  });

  it('should highlight no brush in the picker for a mixed selection', () => {
    // mock
    const setDockedPanel = vi.fn();

    // before
    const { result } = renderHook(() => useStrokeBrushPicker(undefined, vi.fn(), vi.fn(), vi.fn()), {
      wrapper: createWrapper(setDockedPanel),
    });

    // action
    act(() => result.current.onTogglePicker());

    // result
    expect(setDockedPanel.mock.calls[0][0].props.selectedBrushId).toBe('');
  });
});
