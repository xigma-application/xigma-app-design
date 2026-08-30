import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useToggleExpandClick } from '../useToggleExpandClick';

const buildEvent = (overrides: Partial<MouseEvent<HTMLElement>> = {}): MouseEvent<HTMLElement> =>
  ({ ctrlKey: false, metaKey: false, stopPropagation: vi.fn(), ...overrides }) as unknown as MouseEvent<HTMLElement>;

describe('useToggleExpandClick', () => {
  it('should call onToggleExpand non-recursively on a plain click', () => {
    // mock
    const onToggleExpand = vi.fn();

    // before
    const { result } = renderHook(() => useToggleExpandClick(onToggleExpand));

    // action
    result.current(buildEvent());

    // result
    expect(onToggleExpand).toHaveBeenCalledWith({ recursive: false });
  });

  it('should call onToggleExpand recursively when Ctrl is held', () => {
    // mock
    const onToggleExpand = vi.fn();

    // before
    const { result } = renderHook(() => useToggleExpandClick(onToggleExpand));

    // action
    result.current(buildEvent({ ctrlKey: true }));

    // result
    expect(onToggleExpand).toHaveBeenCalledWith({ recursive: true });
  });

  it('should call onToggleExpand recursively when Cmd (metaKey) is held', () => {
    // mock
    const onToggleExpand = vi.fn();

    // before
    const { result } = renderHook(() => useToggleExpandClick(onToggleExpand));

    // action
    result.current(buildEvent({ metaKey: true }));

    // result
    expect(onToggleExpand).toHaveBeenCalledWith({ recursive: true });
  });

  it('should stop the click from propagating, so it does not also select the row', () => {
    // mock
    const stopPropagation = vi.fn();

    // before
    const { result } = renderHook(() => useToggleExpandClick(vi.fn()));

    // action
    result.current(buildEvent({ stopPropagation }));

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });
});
