import { renderHook } from '@testing-library/react';

// hooks
import { useSelectDropdownOption } from '../useSelectDropdownOption';

describe('useSelectDropdownOption', () => {
  it('should call onSelect with the chosen value', () => {
    // mock
    const onSelect = vi.fn();

    // before
    const { result } = renderHook(() => useSelectDropdownOption(onSelect));

    // action
    result.current('rgb')();

    // result
    expect(onSelect).toHaveBeenCalledWith('rgb');
  });
});
