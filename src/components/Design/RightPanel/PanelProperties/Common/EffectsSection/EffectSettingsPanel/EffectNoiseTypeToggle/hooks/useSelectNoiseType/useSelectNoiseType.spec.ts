import { renderHook } from '@testing-library/react';

// hooks
import { useSelectNoiseType } from './useSelectNoiseType';

// types
import { EffectNoiseType } from 'types/design/enums';

describe('useSelectNoiseType', () => {
  it('should pass Mono and Duo through', () => {
    // mock
    const onChange = vi.fn();
    const { result } = renderHook(() => useSelectNoiseType(onChange));

    // action
    result.current('duo');
    result.current('mono');

    // result
    expect(onChange).toHaveBeenNthCalledWith(1, EffectNoiseType.duo);
    expect(onChange).toHaveBeenNthCalledWith(2, EffectNoiseType.mono);
  });

  it('should ignore Multi, which is not implemented yet', () => {
    // mock
    const onChange = vi.fn();
    const { result } = renderHook(() => useSelectNoiseType(onChange));

    // action
    result.current('multi');

    // result
    expect(onChange).not.toHaveBeenCalled();
  });
});
