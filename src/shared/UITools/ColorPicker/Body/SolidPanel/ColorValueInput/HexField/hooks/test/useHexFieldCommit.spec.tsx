import { renderHook } from '@testing-library/react';

// hooks
import { useHexFieldCommit } from '../useHexFieldCommit';

const createBlurEvent = (value: string): React.FocusEvent<HTMLInputElement> =>
  ({ target: { value } }) as unknown as React.FocusEvent<HTMLInputElement>;

const createKeyDownEvent = (value: string, key: string): React.KeyboardEvent<HTMLInputElement> =>
  ({ currentTarget: { blur: vi.fn(), value }, key }) as unknown as React.KeyboardEvent<HTMLInputElement>;

const createArrowKeyDownEvent = (
  value: string,
  key: string,
  selectionStart: number,
  selectionEnd: number,
): React.KeyboardEvent<HTMLInputElement> =>
  ({
    currentTarget: { blur: vi.fn(), selectionEnd, selectionStart, value },
    key,
    preventDefault: vi.fn(),
  }) as unknown as React.KeyboardEvent<HTMLInputElement>;

describe('useHexFieldCommit', () => {
  it('should commit a normalized hex value on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));

    // action
    result.current.onBlur(createBlurEvent('F00'));

    // result
    expect(onCommit).toHaveBeenCalledWith('#ff0000');
  });

  it('should not commit an invalid hex value on blur and restore the previous value', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#123456', onCommit));
    const event = createBlurEvent('zzz');

    // action
    result.current.onBlur(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('123456');
  });

  it('should restore the previous value when the field is cleared', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#123456', onCommit));
    const event = createBlurEvent('');

    // action
    result.current.onBlur(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('123456');
  });

  it('should commit and blur the field when Enter is pressed', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));
    const event = createKeyDownEvent('00ff00', 'Enter');

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).toHaveBeenCalledWith('#00ff00');
    expect(event.currentTarget.blur).toHaveBeenCalled();
  });

  it('should not commit on a non-Enter key press', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));

    // action
    result.current.onKeyDown(createKeyDownEvent('00ff00', 'Tab'));

    // result
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('should increment the selected pair on ArrowUp and prevent default scrolling', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));
    const event = createArrowKeyDownEvent('ff9900', 'ArrowUp', 2, 4);

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).toHaveBeenCalledWith('#ff9a00');
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should decrement the selected pair on ArrowDown', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));
    const event = createArrowKeyDownEvent('ff9900', 'ArrowDown', 2, 4);

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).toHaveBeenCalledWith('#ff9800');
  });

  it('should expand an odd-length selection up to the next full pair', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));
    const event = createArrowKeyDownEvent('ff9900', 'ArrowUp', 0, 3);

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).toHaveBeenCalledWith('#ff9a00');
  });

  it('should treat a null selection as starting at the beginning of the field', () => {
    // mock
    const onCommit = vi.fn();
    const event = createArrowKeyDownEvent('aa9900', 'ArrowUp', 2, 4);

    event.currentTarget.selectionStart = null as unknown as number;
    event.currentTarget.selectionEnd = null as unknown as number;

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));

    // action
    result.current.onKeyDown(event);

    // result — no selection defaults to position 0, stepping the first pair
    expect(onCommit).toHaveBeenCalledWith('#ab9900');
  });

  it('should not commit or prevent default when the current value is not valid hex', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));
    const event = createArrowKeyDownEvent('zzzzzz', 'ArrowUp', 0, 1);

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should focus and select the affected pair once the input remounts', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useHexFieldCommit('#000000', onCommit));
    result.current.onKeyDown(createArrowKeyDownEvent('ff9900', 'ArrowUp', 2, 4));

    const node = { focus: vi.fn(), setSelectionRange: vi.fn() } as unknown as HTMLInputElement;

    // action
    result.current.inputRef(node);

    // result
    expect(node.focus).toHaveBeenCalled();
    expect(node.setSelectionRange).toHaveBeenCalledWith(2, 4);
  });
});
