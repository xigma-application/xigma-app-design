import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

// hooks
import { useStrokeBrushPicker } from '../useStrokeBrushPicker';
import { StrokeSettingsDockedPanelContext } from '../../../StrokeSettingsDockedPanelContext';

describe('useStrokeBrushPicker', () => {
  it('should dock the picker on toggle, select a brush through it, and close', () => {
    // before
    const setDockedPanel = vi.fn();
    const onBrushSelect = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <StrokeSettingsDockedPanelContext.Provider value={setDockedPanel}>{children}</StrokeSettingsDockedPanelContext.Provider>
    );

    const { result } = renderHook(() => useStrokeBrushPicker('heist', onBrushSelect), { wrapper });

    // result
    expect(result.current.isPickerOpen).toBe(false);

    // action
    act(() => result.current.onTogglePicker());

    // result
    expect(result.current.isPickerOpen).toBe(true);
    expect(setDockedPanel).toHaveBeenCalledWith(expect.anything());

    // action: simulate selecting a brush from the docked picker's onSelect prop
    const dockedPicker = setDockedPanel.mock.calls[0][0];

    act(() => dockedPicker.props.onSelect('noir'));

    // result
    expect(onBrushSelect).toHaveBeenCalledWith('noir');
    expect(result.current.isPickerOpen).toBe(false);
    expect(setDockedPanel).toHaveBeenLastCalledWith(null);
  });

  it('should close the picker on toggle when already open', () => {
    // before
    const setDockedPanel = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <StrokeSettingsDockedPanelContext.Provider value={setDockedPanel}>{children}</StrokeSettingsDockedPanelContext.Provider>
    );

    const { result } = renderHook(() => useStrokeBrushPicker('heist', vi.fn()), { wrapper });

    act(() => result.current.onTogglePicker());
    act(() => result.current.onTogglePicker());

    // result
    expect(result.current.isPickerOpen).toBe(false);
    expect(setDockedPanel).toHaveBeenLastCalledWith(null);
  });

  it('should preview a brush on hover and revert it once the hover ends without a click', () => {
    // before
    const setDockedPanel = vi.fn();
    const onBrushSelect = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <StrokeSettingsDockedPanelContext.Provider value={setDockedPanel}>{children}</StrokeSettingsDockedPanelContext.Provider>
    );

    const { result } = renderHook(() => useStrokeBrushPicker('heist', onBrushSelect), { wrapper });

    act(() => result.current.onTogglePicker());

    const dockedPicker = setDockedPanel.mock.calls[0][0];

    // action
    act(() => dockedPicker.props.onOptionHoverStart('noir'));

    // result
    expect(onBrushSelect).toHaveBeenLastCalledWith('noir');

    // action
    act(() => dockedPicker.props.onOptionHoverEnd());

    // result
    expect(onBrushSelect).toHaveBeenLastCalledWith('heist');
    expect(result.current.isPickerOpen).toBe(true);
  });

  it('should revert to the original brush when the picker is cancelled after a hover preview', () => {
    // before
    const setDockedPanel = vi.fn();
    const onBrushSelect = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <StrokeSettingsDockedPanelContext.Provider value={setDockedPanel}>{children}</StrokeSettingsDockedPanelContext.Provider>
    );

    const { result } = renderHook(() => useStrokeBrushPicker('heist', onBrushSelect), { wrapper });

    act(() => result.current.onTogglePicker());

    const dockedPicker = setDockedPanel.mock.calls[0][0];

    act(() => dockedPicker.props.onOptionHoverStart('noir'));

    // action
    act(() => dockedPicker.props.onClose());

    // result
    expect(onBrushSelect).toHaveBeenLastCalledWith('heist');
    expect(result.current.isPickerOpen).toBe(false);
    expect(setDockedPanel).toHaveBeenLastCalledWith(null);
  });
});
