import { act, renderHook } from '@testing-library/react';

// hooks
import { useStrokeSettingsBasicTab } from '../useStrokeSettingsBasicTab';

describe('useStrokeSettingsBasicTab', () => {
  it('should start solid and become dashed when the dashed style is selected', () => {
    // before
    const { result } = renderHook(() => useStrokeSettingsBasicTab());

    // result
    expect(result.current).toMatchObject({ hasDashes: false, isCustom: false, isDashed: false, style: 'solid' });

    // action
    act(() => result.current.onStyleSelect('dashed'));

    // result
    expect(result.current).toMatchObject({ hasDashes: true, isCustom: false, isDashed: true, style: 'dashed' });

    // action
    act(() => result.current.onStyleSelect('custom'));

    // result
    expect(result.current).toMatchObject({ hasDashes: true, isCustom: true, isDashed: false });
  });
});
