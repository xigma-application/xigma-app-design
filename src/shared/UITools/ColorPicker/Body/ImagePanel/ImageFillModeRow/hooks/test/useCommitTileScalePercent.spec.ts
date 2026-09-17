import { FocusEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useCommitTileScalePercent } from '../useCommitTileScalePercent';

const createEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('useCommitTileScalePercent', () => {
  it('should convert a plain percent string into a ratio', () => {
    // mock
    const onTileScaleChange = vi.fn();

    // before
    const { result } = renderHook(() => useCommitTileScalePercent(onTileScaleChange));

    // action
    result.current(createEvent('200'));

    // result
    expect(onTileScaleChange).toHaveBeenCalledWith(2);
  });

  it('should strip a trailing % sign before parsing', () => {
    // mock
    const onTileScaleChange = vi.fn();

    // before
    const { result } = renderHook(() => useCommitTileScalePercent(onTileScaleChange));

    // action
    result.current(createEvent('50%'));

    // result
    expect(onTileScaleChange).toHaveBeenCalledWith(0.5);
  });

  it('should clamp below the minimum', () => {
    // mock
    const onTileScaleChange = vi.fn();

    // before
    const { result } = renderHook(() => useCommitTileScalePercent(onTileScaleChange));

    // action
    result.current(createEvent('0'));

    // result
    expect(onTileScaleChange).toHaveBeenCalledWith(0.01);
  });

  it('should clamp above the maximum', () => {
    // mock
    const onTileScaleChange = vi.fn();

    // before
    const { result } = renderHook(() => useCommitTileScalePercent(onTileScaleChange));

    // action
    result.current(createEvent('5000'));

    // result
    expect(onTileScaleChange).toHaveBeenCalledWith(10);
  });

  it('should do nothing for an empty or non-numeric value', () => {
    // mock
    const onTileScaleChange = vi.fn();

    // before
    const { result } = renderHook(() => useCommitTileScalePercent(onTileScaleChange));

    // action
    result.current(createEvent(''));
    result.current(createEvent('abc'));

    // result
    expect(onTileScaleChange).not.toHaveBeenCalled();
  });

  it('should do nothing when no callback is given', () => {
    // before
    const { result } = renderHook(() => useCommitTileScalePercent(undefined));

    // action + result — should not throw
    expect(() => result.current(createEvent('50'))).not.toThrow();
  });
});
