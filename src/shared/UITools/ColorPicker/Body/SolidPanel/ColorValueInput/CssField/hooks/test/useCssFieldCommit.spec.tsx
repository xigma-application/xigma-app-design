import { renderHook } from '@testing-library/react';

// hooks
import { useCssFieldCommit } from '../useCssFieldCommit';

// utils
import { stepCssValue } from '../../utils/stepCssValue';

vi.mock('../../utils/stepCssValue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/stepCssValue')>();

  return { stepCssValue: vi.fn(actual.stepCssValue) };
});

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

describe('useCssFieldCommit', () => {
  it('should commit a parsed color on blur', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(13, 153, 255, 1)', onCommit));

    // action
    result.current.onBlur(createBlurEvent('rgba(13, 153, 255, 0.5)'));

    // result
    expect(onCommit).toHaveBeenCalledWith({ alpha: 50, hex: '#0d99ff' });
  });

  it('should not commit an unparsable value on blur and restore the previous value', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(13, 153, 255, 1)', onCommit));
    const event = createBlurEvent('not a color');

    // action
    result.current.onBlur(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('rgba(13, 153, 255, 1)');
  });

  it('should restore the previous value when the field is cleared', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(13, 153, 255, 1)', onCommit));
    const event = createBlurEvent('');

    // action
    result.current.onBlur(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.target.value).toBe('rgba(13, 153, 255, 1)');
  });

  it('should commit and blur the field when Enter is pressed', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(0, 0, 0, 1)', onCommit));
    const event = createKeyDownEvent('rgb(0, 255, 0)', 'Enter');

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).toHaveBeenCalledWith({ alpha: 100, hex: '#00ff00' });
    expect(event.currentTarget.blur).toHaveBeenCalled();
  });

  it('should not commit on a non-Enter key press', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(0, 0, 0, 1)', onCommit));

    // action
    result.current.onKeyDown(createKeyDownEvent('rgb(0, 255, 0)', 'Tab'));

    // result
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('should step the token under the cursor on ArrowUp and prevent default scrolling', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(13, 153, 255, 1)', onCommit));
    const event = createArrowKeyDownEvent('rgba(13, 153, 255, 1)', 'ArrowUp', 6, 6);

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).toHaveBeenCalledWith({ alpha: 100, hex: '#0e99ff' });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not commit or prevent default when the current value is not valid css', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(13, 153, 255, 1)', onCommit));
    const event = createArrowKeyDownEvent('not a color', 'ArrowUp', 0, 1);

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should treat a null selection as starting at the beginning of the field', () => {
    // mock
    const onCommit = vi.fn();
    const event = createArrowKeyDownEvent('rgba(13, 153, 200, 0.5)', 'ArrowUp', 6, 6);

    event.currentTarget.selectionStart = null as unknown as number;
    event.currentTarget.selectionEnd = null as unknown as number;

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(13, 153, 200, 0.5)', onCommit));

    // action
    result.current.onKeyDown(event);

    // result — no selection defaults to position 0, stepping the r token
    expect(onCommit).toHaveBeenCalledWith({ alpha: 50, hex: '#0e99c8' });
  });

  it('should not commit when the stepped value cannot be reparsed as a color', () => {
    // mock
    const onCommit = vi.fn();

    vi.mocked(stepCssValue).mockReturnValueOnce({ selectionEnd: 1, selectionStart: 0, value: 'not a color' });

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(13, 153, 255, 1)', onCommit));
    const event = createArrowKeyDownEvent('rgba(13, 153, 255, 1)', 'ArrowUp', 6, 6);

    // action
    result.current.onKeyDown(event);

    // result
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should focus and select the affected token once the input remounts', () => {
    // mock
    const onCommit = vi.fn();

    // before
    const { result } = renderHook(() => useCssFieldCommit('rgba(13, 153, 255, 1)', onCommit));
    result.current.onKeyDown(createArrowKeyDownEvent('rgba(13, 153, 255, 1)', 'ArrowUp', 6, 6));

    const node = { focus: vi.fn(), setSelectionRange: vi.fn() } as unknown as HTMLInputElement;

    // action
    result.current.inputRef(node);

    // result
    expect(node.focus).toHaveBeenCalled();
    expect(node.setSelectionRange).toHaveBeenCalledWith(5, 7);
  });
});
