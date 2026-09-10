import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectInputOnClick } from '../useSelectInputOnClick';

const createClickEvent = (select: () => void): MouseEvent<HTMLInputElement> =>
  ({ currentTarget: { select } }) as unknown as MouseEvent<HTMLInputElement>;

describe('useSelectInputOnClick', () => {
  it("should select the input's content", () => {
    // mock
    const select = vi.fn();
    const { result } = renderHook(() => useSelectInputOnClick(undefined));

    // action
    result.current(createClickEvent(select));

    // result
    expect(select).toHaveBeenCalled();
  });

  it('should still forward the click to the given onClick prop', () => {
    // mock
    const onClick = vi.fn();
    const { result } = renderHook(() => useSelectInputOnClick(onClick));
    const event = createClickEvent(vi.fn());

    // action
    result.current(event);

    // result
    expect(onClick).toHaveBeenCalledWith(event);
  });

  it('should not throw when no onClick prop is given', () => {
    // mock
    const { result } = renderHook(() => useSelectInputOnClick(undefined));

    // action & result
    expect(() => result.current(createClickEvent(vi.fn()))).not.toThrow();
  });
});
