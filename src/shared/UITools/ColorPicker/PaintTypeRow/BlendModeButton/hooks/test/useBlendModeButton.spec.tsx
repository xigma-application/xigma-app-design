import { act, renderHook } from '@testing-library/react';

// hooks
import { useBlendModeButton } from '../useBlendModeButton';

// types
import { BlendMode } from 'types/design/enums';

describe('useBlendModeButton', () => {
  it('should show the empty drop icon when the blend mode is Normal', () => {
    // before
    const { result } = renderHook(() => useBlendModeButton(BlendMode.normal));

    // result
    expect(result.current.icon).toBe('DropEmpty');
  });

  it('should show the filled drop icon when a non-default blend mode is applied', () => {
    // before
    const { result } = renderHook(() => useBlendModeButton(BlendMode.multiply));

    // result
    expect(result.current.icon).toBe('DropFilled');
  });

  it('should default to closed', () => {
    // before
    const { result } = renderHook(() => useBlendModeButton(BlendMode.normal));

    // result
    expect(result.current.open).toBe(false);
  });

  it('should track the open state through onOpenChange', () => {
    // before
    const { result } = renderHook(() => useBlendModeButton(BlendMode.normal));

    // action
    act(() => result.current.onOpenChange(true));

    // result
    expect(result.current.open).toBe(true);
  });

  it('should call onChange with the selected blend mode', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useBlendModeButton(BlendMode.normal, onChange));

    // action
    result.current.selectBlendMode(BlendMode.multiply)();

    // result
    expect(onChange).toHaveBeenCalledWith(BlendMode.multiply);
  });

  it('should not throw when selecting a blend mode without an onChange callback', () => {
    // before
    const { result } = renderHook(() => useBlendModeButton(BlendMode.normal));

    // result
    expect(() => result.current.selectBlendMode(BlendMode.multiply)()).not.toThrow();
  });
});
