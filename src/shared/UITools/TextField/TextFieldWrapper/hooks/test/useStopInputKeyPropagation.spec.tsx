import { KeyboardEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useStopInputKeyPropagation } from '../useStopInputKeyPropagation';

const createKeyEvent = (key: string, blur: () => void, stopPropagation: () => void = vi.fn()): KeyboardEvent<HTMLInputElement> =>
  ({ currentTarget: { blur }, key, stopPropagation }) as unknown as KeyboardEvent<HTMLInputElement>;

describe('useStopInputKeyPropagation', () => {
  it('should blur the input and stop propagation on Enter', () => {
    // mock
    const blur = vi.fn();
    const stopPropagation = vi.fn();
    const { result } = renderHook(() => useStopInputKeyPropagation(undefined));

    // action
    result.current(createKeyEvent('Enter', blur, stopPropagation));

    // result
    expect(blur).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('should stop propagation without blurring on Backspace', () => {
    // mock
    const blur = vi.fn();
    const stopPropagation = vi.fn();
    const { result } = renderHook(() => useStopInputKeyPropagation(undefined));

    // action
    result.current(createKeyEvent('Backspace', blur, stopPropagation));

    // result
    expect(stopPropagation).toHaveBeenCalled();
    expect(blur).not.toHaveBeenCalled();
  });

  it('should stop propagation without blurring on Delete', () => {
    // mock
    const blur = vi.fn();
    const stopPropagation = vi.fn();
    const { result } = renderHook(() => useStopInputKeyPropagation(undefined));

    // action
    result.current(createKeyEvent('Delete', blur, stopPropagation));

    // result
    expect(stopPropagation).toHaveBeenCalled();
    expect(blur).not.toHaveBeenCalled();
  });

  it('should stop propagation without blurring for any other key', () => {
    // mock
    const blur = vi.fn();
    const stopPropagation = vi.fn();
    const { result } = renderHook(() => useStopInputKeyPropagation(undefined));

    // action
    result.current(createKeyEvent('a', blur, stopPropagation));

    // result
    expect(blur).not.toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('should still forward every key to the given onKeyDown prop', () => {
    // mock
    const onKeyDown = vi.fn();
    const { result } = renderHook(() => useStopInputKeyPropagation(onKeyDown));
    const event = createKeyEvent('Enter', vi.fn());

    // action
    result.current(event);

    // result
    expect(onKeyDown).toHaveBeenCalledWith(event);
  });

  it('should not throw when no onKeyDown prop is given', () => {
    // mock
    const { result } = renderHook(() => useStopInputKeyPropagation(undefined));

    // action & result
    expect(() => result.current(createKeyEvent('a', vi.fn()))).not.toThrow();
  });
});
