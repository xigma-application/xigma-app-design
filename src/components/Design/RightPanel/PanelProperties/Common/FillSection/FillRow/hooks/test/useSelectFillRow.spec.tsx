import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectFillRow } from '../useSelectFillRow';

describe('useSelectFillRow behaviors', () => {
  it('should call onSelect with meta/shift flags derived from the event', () => {
    // mock
    const onSelect = vi.fn();
    const event = { ctrlKey: false, metaKey: true, shiftKey: false } as unknown as MouseEvent<HTMLDivElement>;

    // before
    const { result } = renderHook(() => useSelectFillRow(onSelect));

    // action
    result.current(event);

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
  });

  it('should treat ctrlKey the same as metaKey', () => {
    // mock
    const onSelect = vi.fn();
    const event = { ctrlKey: true, metaKey: false, shiftKey: true } as unknown as MouseEvent<HTMLDivElement>;

    // before
    const { result } = renderHook(() => useSelectFillRow(onSelect));

    // action
    result.current(event);

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: true });
  });
});
