import { renderHook } from '@testing-library/react';

// hooks
import { useSetActiveTab } from '../useSetActiveTab';

// types
import { ColorPickerTab } from '../../enums';
import { TUseGradientPanelResult } from '../../Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';

const VALUE = { alpha: 100, hex: '#ff0000' };

const GRADIENT_PANEL = {
  angle: 90,
  stops: [{ color: '#ffffff', id: 'a', opacity: 100, position: 0 }],
  type: 'gradient-radial',
} as TUseGradientPanelResult;

describe('useSetActiveTab', () => {
  it('should call setActiveTab when the tab name is a known ColorPickerTab', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(setActiveTab, vi.fn(), VALUE, GRADIENT_PANEL));

    // action
    result.current(ColorPickerTab.gradient);

    // result
    expect(setActiveTab).toHaveBeenCalledWith(ColorPickerTab.gradient);
  });

  it('should not call setActiveTab when the tab name is unknown', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(setActiveTab, vi.fn(), VALUE, GRADIENT_PANEL));

    // action
    result.current('unknown');

    // result
    expect(setActiveTab).not.toHaveBeenCalled();
  });

  it('should commit the current gradient panel state through onGradientChange when switching to Gradient', () => {
    // mock
    const onGradientChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, GRADIENT_PANEL, onGradientChange));

    // action
    result.current(ColorPickerTab.gradient);

    // result
    expect(onGradientChange).toHaveBeenCalledWith({ angle: 90, stops: GRADIENT_PANEL.stops, type: 'gradient-radial' });
  });

  it('should not throw when switching to Gradient without an onGradientChange callback', () => {
    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), vi.fn(), VALUE, GRADIENT_PANEL));

    // result
    expect(() => result.current(ColorPickerTab.gradient)).not.toThrow();
  });

  it('should commit the current solid value through onChange when switching to Solid', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), onChange, VALUE, GRADIENT_PANEL));

    // action
    result.current(ColorPickerTab.solid);

    // result
    expect(onChange).toHaveBeenCalledWith(VALUE);
  });

  it('should not commit anything when the tab name is unknown', () => {
    // mock
    const onChange = vi.fn();
    const onGradientChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetActiveTab(vi.fn(), onChange, VALUE, GRADIENT_PANEL, onGradientChange));

    // action
    result.current('unknown');

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(onGradientChange).not.toHaveBeenCalled();
  });
});
