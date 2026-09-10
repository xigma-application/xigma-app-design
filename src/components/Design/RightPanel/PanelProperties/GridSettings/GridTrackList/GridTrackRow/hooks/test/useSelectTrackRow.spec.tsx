import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectTrackRow } from '../useSelectTrackRow';

const createClickEvent = (overrides: Partial<{ ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }> = {}): MouseEvent<HTMLDivElement> =>
  ({ ctrlKey: false, metaKey: false, shiftKey: false, ...overrides }) as MouseEvent<HTMLDivElement>;

describe('useSelectTrackRow', () => {
  it('should report no modifiers for a plain click', () => {
    // mock
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectTrackRow(onSelect));

    // action
    result.current(createClickEvent());

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: false, shift: false });
  });

  it('should report meta when the meta key is held', () => {
    // mock
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectTrackRow(onSelect));

    // action
    result.current(createClickEvent({ metaKey: true }));

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
  });

  it('should also report meta when the ctrl key is held', () => {
    // mock
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectTrackRow(onSelect));

    // action
    result.current(createClickEvent({ ctrlKey: true }));

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
  });

  it('should report shift when the shift key is held', () => {
    // mock
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectTrackRow(onSelect));

    // action
    result.current(createClickEvent({ shiftKey: true }));

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: false, shift: true });
  });
});
