import { FocusEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useCommitFillTrackValue } from '../useCommitFillTrackValue';

// types
import { SizingMode } from 'types/design/enums';

const createBlurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ target: { value } }) as FocusEvent<HTMLInputElement>;

describe('useCommitFillTrackValue', () => {
  it('should update the fill weight when the value stays an exact "<number>fr"', () => {
    // mock
    const onChangeMode = vi.fn();
    const onChangeValue = vi.fn();
    const { result } = renderHook(() => useCommitFillTrackValue(onChangeMode, onChangeValue));

    // action
    result.current(createBlurEvent('2fr'));

    // result
    expect(onChangeValue).toHaveBeenCalledWith(2);
    expect(onChangeMode).not.toHaveBeenCalled();
  });

  it('should switch the track to fixed when the unit is broken', () => {
    // mock
    const onChangeMode = vi.fn();
    const onChangeValue = vi.fn();
    const { result } = renderHook(() => useCommitFillTrackValue(onChangeMode, onChangeValue));

    // action
    result.current(createBlurEvent('320'));

    // result
    expect(onChangeMode).toHaveBeenCalledWith(SizingMode.fixed, 320);
    expect(onChangeValue).not.toHaveBeenCalled();
  });

  it('should do nothing when the value cannot be parsed', () => {
    // mock
    const onChangeMode = vi.fn();
    const onChangeValue = vi.fn();
    const { result } = renderHook(() => useCommitFillTrackValue(onChangeMode, onChangeValue));

    // action
    result.current(createBlurEvent(''));

    // result
    expect(onChangeMode).not.toHaveBeenCalled();
    expect(onChangeValue).not.toHaveBeenCalled();
  });
});
