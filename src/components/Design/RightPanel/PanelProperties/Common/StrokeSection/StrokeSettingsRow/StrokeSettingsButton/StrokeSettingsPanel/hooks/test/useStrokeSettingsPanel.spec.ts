import { act, renderHook } from '@testing-library/react';

// hooks
import { useStrokeSettingsPanel } from '../useStrokeSettingsPanel';

// types
import { StrokeSettingsTab } from '../../enums';

describe('useStrokeSettingsPanel', () => {
  it('should start on the Basic tab and switch tabs', () => {
    // before
    const { result } = renderHook(() => useStrokeSettingsPanel());

    // result
    expect(result.current.activeTab).toBe(StrokeSettingsTab.basic);

    // action
    act(() => result.current.onTabChange(StrokeSettingsTab.brush));

    // result
    expect(result.current.activeTab).toBe(StrokeSettingsTab.brush);
  });
});
