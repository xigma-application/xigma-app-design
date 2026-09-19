import { act, renderHook } from '@testing-library/react';

// hooks
import { useStrokeSettingsBrushTab } from '../useStrokeSettingsBrushTab';

describe('useStrokeSettingsBrushTab', () => {
  it('should start on the first brush pointing right and update both selections', () => {
    // before
    const { result } = renderHook(() => useStrokeSettingsBrushTab());

    // result
    expect(result.current).toMatchObject({ brush: 'heist', direction: 'right' });

    // action
    act(() => result.current.onBrushSelect('noir'));
    act(() => result.current.onDirectionChange('left'));

    // result
    expect(result.current).toMatchObject({ brush: 'noir', direction: 'left' });
  });
});
