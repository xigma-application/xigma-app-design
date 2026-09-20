import { renderHook } from '@testing-library/react';

// hooks
import { useSelectNoiseType } from './useSelectNoiseType';

// types
import { EffectNoiseType } from 'types/design/enums';

describe('useSelectNoiseType', () => {
  it('should pass Mono, Duo and Multi through', () => {
    // mock
    const onChange = vi.fn();
    const { result } = renderHook(() => useSelectNoiseType(onChange));

    // action
    result.current('duo');
    result.current('mono');
    result.current('multi');

    // result
    expect(onChange).toHaveBeenNthCalledWith(1, EffectNoiseType.duo);
    expect(onChange).toHaveBeenNthCalledWith(2, EffectNoiseType.mono);
    expect(onChange).toHaveBeenNthCalledWith(3, EffectNoiseType.multi);
  });
});
