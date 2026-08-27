import { renderHook } from '@testing-library/react';

// hooks
import { useColorSamplerEvents } from '../useColorSamplerEvents';

describe('useColorSamplerEvents', () => {
  it('should start with no colors and no known pointer position', () => {
    // before
    const { result } = renderHook(() => useColorSamplerEvents());

    // result
    expect(result.current).toStrictEqual({ colors: null, mousePosition: null });
  });
});
