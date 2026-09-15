import { renderHook } from '@testing-library/react';

// hooks
import { useNotifyGradientPanelState } from '../useNotifyGradientPanelState';

// types
import { ColorPickerTab } from '../../enums';
import { TUseGradientPanelResult } from '../../Body/GradientPanel/hooks/useGradientPanel/useGradientPanel';

const gradientPanelFor = (overrides: Partial<TUseGradientPanelResult> = {}): TUseGradientPanelResult =>
  ({
    selectedStopId: null,
    stops: [
      { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
      { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
    ],
    ...overrides,
  }) as TUseGradientPanelResult;

describe('useNotifyGradientPanelState', () => {
  it('should report a null selectedStopIndex when no stop is selected', () => {
    // mock
    const onGradientPanelStateChange = vi.fn();

    // before
    renderHook(() => useNotifyGradientPanelState(ColorPickerTab.gradient, gradientPanelFor(), onGradientPanelStateChange));

    // result
    expect(onGradientPanelStateChange).toHaveBeenCalledWith({ isGradientTabActive: true, selectedStopIndex: null });
  });

  it('should report the real index of the selected stop', () => {
    // mock
    const onGradientPanelStateChange = vi.fn();

    // before
    renderHook(() =>
      useNotifyGradientPanelState(ColorPickerTab.solid, gradientPanelFor({ selectedStopId: 'stop-2' }), onGradientPanelStateChange),
    );

    // result
    expect(onGradientPanelStateChange).toHaveBeenCalledWith({ isGradientTabActive: false, selectedStopIndex: 1 });
  });

  it('should not throw when no callback is given', () => {
    // before / result
    expect(() => renderHook(() => useNotifyGradientPanelState(ColorPickerTab.gradient, gradientPanelFor()))).not.toThrow();
  });
});
