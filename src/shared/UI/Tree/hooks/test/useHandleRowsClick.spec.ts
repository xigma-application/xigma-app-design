import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useHandleRowsClick } from '../useHandleRowsClick';

describe('useHandleRowsClick', () => {
  it('should call onDeselectAll when the click target is the rows container itself', () => {
    // mock
    const onDeselectAll = vi.fn();
    const target = {};

    // before
    const { result } = renderHook(() => useHandleRowsClick(onDeselectAll));

    // action
    result.current({ currentTarget: target, target } as unknown as MouseEvent<HTMLDivElement>);

    // result
    expect(onDeselectAll).toHaveBeenCalledTimes(1);
  });

  it('should not call onDeselectAll when the click bubbled up from a child element', () => {
    // mock
    const onDeselectAll = vi.fn();

    // before
    const { result } = renderHook(() => useHandleRowsClick(onDeselectAll));

    // action
    result.current({ currentTarget: {}, target: {} } as unknown as MouseEvent<HTMLDivElement>);

    // result
    expect(onDeselectAll).not.toHaveBeenCalled();
  });

  it('should tolerate onDeselectAll not being provided', () => {
    // before
    const { result } = renderHook(() => useHandleRowsClick());
    const target = {};

    // action & result — should not throw
    expect(() => result.current({ currentTarget: target, target } as unknown as MouseEvent<HTMLDivElement>)).not.toThrow();
  });
});
