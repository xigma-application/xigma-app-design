import { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useEditableInput } from '../useEditableInput';

const blurEvent = (value: string): FocusEvent<HTMLInputElement> => ({ currentTarget: { value } }) as FocusEvent<HTMLInputElement>;

const keyEvent = (key: string): KeyboardEvent<HTMLInputElement> & { blur: TFunc; preventDefault: TFunc } => {
  const blur = vi.fn();

  return { blur, currentTarget: { blur }, key, preventDefault: vi.fn() } as unknown as KeyboardEvent<HTMLInputElement> & {
    blur: TFunc;
    preventDefault: TFunc;
  };
};

describe('useEditableInput', () => {
  it('should start in display mode with the value as draft, or in edit mode with autoEdit', () => {
    // before
    const { result } = renderHook(() => useEditableInput('Page 1', vi.fn(), vi.fn()));
    const { result: autoResult } = renderHook(() => useEditableInput('Page 1', vi.fn(), vi.fn(), true));

    // result
    expect(result.current).toMatchObject({ draft: 'Page 1', isEditing: false });
    expect(autoResult.current.isEditing).toBe(true);
  });

  it('should follow a new value and enter edit mode when autoEdit turns on', () => {
    // before
    const { rerender, result } = renderHook(({ autoEdit, value }) => useEditableInput(value, vi.fn(), vi.fn(), autoEdit), {
      initialProps: { autoEdit: false, value: 'Page 1' },
    });

    // action
    rerender({ autoEdit: true, value: 'Page 2' });

    // result
    expect(result.current).toMatchObject({ draft: 'Page 2', isEditing: true });
  });

  it('should start editing from Enter or Space on the display, and ignore other keys', () => {
    // mock
    const onEditingChange = vi.fn();
    const other = keyEvent('a');
    const space = keyEvent(' ');

    // before
    const { result } = renderHook(() => useEditableInput('Page 1', vi.fn(), onEditingChange));

    // action
    act(() => result.current.handleDisplayKeyDown(other));

    // result
    expect(result.current.isEditing).toBe(false);
    expect(other.preventDefault).not.toHaveBeenCalled();

    // action
    act(() => result.current.handleDisplayKeyDown(space));

    // result
    expect(space.preventDefault).toHaveBeenCalledTimes(1);
    expect(result.current.isEditing).toBe(true);
    expect(onEditingChange).toHaveBeenCalledWith(true);

    // action
    act(() => result.current.handleDisplayKeyDown(keyEvent('Enter')));

    // result
    expect(result.current.isEditing).toBe(true);
  });

  it('should update the draft on change and select the text on focus', () => {
    // mock
    const select = vi.fn();

    // before
    const { result } = renderHook(() => useEditableInput('Page 1', vi.fn(), vi.fn()));

    // action
    act(() => result.current.handleChange({ target: { value: 'Draft' } } as ChangeEvent<HTMLInputElement>));
    act(() => result.current.handleFocus({ currentTarget: { select } } as unknown as FocusEvent<HTMLInputElement>));

    // result
    expect(result.current.draft).toBe('Draft');
    expect(select).toHaveBeenCalledTimes(1);
  });

  it('should commit a trimmed, changed value on blur and leave edit mode', () => {
    // mock
    const onChange = vi.fn();
    const onEditingChange = vi.fn();

    // before
    const { result } = renderHook(() => useEditableInput('Page 1', onChange, onEditingChange));

    // action
    act(() => result.current.startEditing());
    act(() => result.current.handleBlur(blurEvent('  Page 2  ')));

    // result
    expect(onChange).toHaveBeenCalledWith('Page 2');
    expect(result.current.isEditing).toBe(false);
    expect(onEditingChange).toHaveBeenLastCalledWith(false);
  });

  it('should restore the value on blur when the text is empty or unchanged', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useEditableInput('Page 1', onChange, vi.fn()));

    // action
    act(() => result.current.handleChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>));
    act(() => result.current.handleBlur(blurEvent('   ')));
    act(() => result.current.handleBlur(blurEvent('Page 1')));

    // result
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.draft).toBe('Page 1');
  });

  it('should blur on Enter, and cancel on Escape without committing', () => {
    // mock
    const onChange = vi.fn();
    const enter = keyEvent('Enter');
    const escape = keyEvent('Escape');

    // before
    const { result } = renderHook(() => useEditableInput('Page 1', onChange, vi.fn()));

    // action
    act(() => result.current.handleKeyDown(enter));

    // result
    expect(enter.blur).toHaveBeenCalledTimes(1);

    // action
    act(() => result.current.handleKeyDown(escape));
    act(() => result.current.handleBlur(blurEvent('Changed')));

    // result
    expect(escape.blur).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(result.current.draft).toBe('Page 1');

    // action
    act(() => result.current.handleBlur(blurEvent('Changed')));

    // result
    expect(onChange).toHaveBeenCalledWith('Changed');
  });
});
