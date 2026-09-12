import { FocusEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useCornerSmoothingPopover } from '../useCornerSmoothingPopover';

const focusEventFor = (value: string): FocusEvent<HTMLInputElement> =>
  ({ target: Object.assign(document.createElement('input'), { value }) }) as unknown as FocusEvent<HTMLInputElement>;

describe('useCornerSmoothingPopover', () => {
  it('should start at 0', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingPopover());

    // result
    expect(result.current.value).toBe(0);
  });

  it('should round a scrubbed value', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingPopover());

    // action
    act(() => result.current.onSliderChange(49.6));

    // result
    expect(result.current.value).toBe(50);
  });

  it('should clamp a value above 100 typed into the field down to 100', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingPopover());

    // action
    act(() => result.current.onBlur(focusEventFor('1000')));

    // result
    expect(result.current.value).toBe(100);
  });

  it('should clamp a negative scrubbed value up to 0', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingPopover());

    // action
    act(() => result.current.onSliderChange(-10));

    // result
    expect(result.current.value).toBe(0);
  });

  it('should reset the field to the current value when the typed value is blank', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingPopover());

    act(() => result.current.onSliderChange(40));

    const input = document.createElement('input');

    input.value = '   ';

    // action
    act(() => result.current.onBlur({ target: input } as unknown as FocusEvent<HTMLInputElement>));

    // result
    expect(result.current.value).toBe(40);
    expect(input.value).toBe('40%');
  });

  it('should ignore a non-numeric typed value', () => {
    // before
    const { result } = renderHook(() => useCornerSmoothingPopover());

    act(() => result.current.onSliderChange(20));

    // action
    act(() => result.current.onBlur(focusEventFor('abc')));

    // result
    expect(result.current.value).toBe(20);
  });
});
