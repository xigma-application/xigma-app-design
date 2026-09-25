import { KeyboardEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useCanvasValueLabelInput } from '../useCanvasValueLabelInput';

const keyEvent = (key: string): KeyboardEvent<HTMLInputElement> & { stopPropagation: TFunc } =>
  ({ key, stopPropagation: vi.fn() }) as unknown as KeyboardEvent<HTMLInputElement> & { stopPropagation: TFunc };

describe('useCanvasValueLabelInput', () => {
  it('should start from the initial value and report live edits', () => {
    // mock
    const onLiveChange = vi.fn();

    // before
    const { result } = renderHook(() => useCanvasValueLabelInput({ initialValue: 12, onCancel: vi.fn(), onCommit: vi.fn(), onLiveChange }));

    // action
    act(() => result.current.handleChange('15'));

    // result
    expect(result.current.value).toBe('15');
    expect(onLiveChange).toHaveBeenCalledWith('15');
  });

  it('should accept edits without a live listener', () => {
    // before
    const { result } = renderHook(() => useCanvasValueLabelInput({ initialValue: 'a', onCancel: vi.fn(), onCommit: vi.fn() }));

    // action
    act(() => result.current.handleChange('b'));

    // result
    expect(result.current.value).toBe('b');
  });

  it('should commit once on Enter, ignoring the blur that follows', () => {
    // mock
    const onCommit = vi.fn();
    const enter = keyEvent('Enter');

    // before
    const { result } = renderHook(() => useCanvasValueLabelInput({ initialValue: 7, onCancel: vi.fn(), onCommit }));

    // action
    act(() => result.current.handleKeyDown(enter));
    act(() => result.current.handleBlur());

    // result
    expect(enter.stopPropagation).toHaveBeenCalled();
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('7');
  });

  it('should cancel on Escape and commit on blur otherwise, ignoring other keys', () => {
    // mock
    const onCancel = vi.fn();
    const onCommit = vi.fn();

    // before
    const cancelled = renderHook(() => useCanvasValueLabelInput({ initialValue: 1, onCancel, onCommit }));
    const blurred = renderHook(() => useCanvasValueLabelInput({ initialValue: 2, onCancel, onCommit }));

    // action
    act(() => cancelled.result.current.handleKeyDown(keyEvent('a')));
    act(() => cancelled.result.current.handleKeyDown(keyEvent('Escape')));
    act(() => blurred.result.current.handleBlur());

    // result
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('2');
  });
});
