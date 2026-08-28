import { renderHook } from '@testing-library/react';

// hooks
import { useSelectNavItem } from '../useSelectNavItem';

// types
import { NavItemName } from '../../types';

describe('useSelectNavItem behaviors', () => {
  it('should call the setter with the selected nav item', () => {
    // mock
    const setActiveNavItem = vi.fn();

    // before
    const { result } = renderHook(() => useSelectNavItem(setActiveNavItem));

    // action
    result.current(NavItemName.tools);

    // result
    expect(setActiveNavItem).toHaveBeenCalledWith(NavItemName.tools);
  });

  it('should ignore the empty value Radix fires when the pressed toggle item is deselected', () => {
    // mock
    const setActiveNavItem = vi.fn();

    // before
    const { result } = renderHook(() => useSelectNavItem(setActiveNavItem));

    // action
    result.current('');

    // result
    expect(setActiveNavItem).not.toHaveBeenCalled();
  });
});
