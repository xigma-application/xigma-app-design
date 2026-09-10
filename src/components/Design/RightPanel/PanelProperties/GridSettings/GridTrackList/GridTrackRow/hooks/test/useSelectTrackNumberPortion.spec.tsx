import { renderHook } from '@testing-library/react';

// hooks
import { useSelectTrackNumberPortion } from '../useSelectTrackNumberPortion';

describe('useSelectTrackNumberPortion', () => {
  it('should select only the numeric prefix of the bound input', () => {
    const { result } = renderHook(() => useSelectTrackNumberPortion());
    const input = document.createElement('input');

    input.type = 'text';
    input.value = '0.75fr';
    result.current.inputRef.current = input;

    result.current.selectNumberPortion();

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(4);
  });

  it('should do nothing when no input is bound', () => {
    const { result } = renderHook(() => useSelectTrackNumberPortion());

    expect(() => result.current.selectNumberPortion()).not.toThrow();
  });
});
