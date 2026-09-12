import { act, renderHook } from '@testing-library/react';

// hooks
import { useBlendModeMenu } from '../useBlendModeMenu';

// types
import { BlendMode } from 'types/design/enums';

describe('useBlendModeMenu', () => {
  it('should default to Pass through', () => {
    // before
    const { result } = renderHook(() => useBlendModeMenu());

    // result
    expect(result.current.value).toBe(BlendMode.passThrough);
  });

  it('should select a blend mode', () => {
    // before
    const { result } = renderHook(() => useBlendModeMenu());

    // action
    act(() => result.current.selectBlendMode(BlendMode.multiply)());

    // result
    expect(result.current.value).toBe(BlendMode.multiply);
  });
});
