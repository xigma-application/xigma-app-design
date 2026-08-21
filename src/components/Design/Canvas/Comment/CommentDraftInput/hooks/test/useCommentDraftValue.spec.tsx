import { act, renderHook } from '@testing-library/react';
import { InputEvent } from 'react';

// hooks
import { useCommentDraftValue } from '../useCommentDraftValue';

const createInputEvent = (text: string): InputEvent<HTMLDivElement> => {
  const currentTarget = document.createElement('div');

  currentTarget.textContent = text;

  return { currentTarget } as InputEvent<HTMLDivElement>;
};

describe('useCommentDraftValue behaviors', () => {
  it('should start with an empty value', () => {
    // before
    const { result } = renderHook(() => useCommentDraftValue());

    // result
    expect(result.current.value).toBe('');
  });

  it('should update the value from the typed textContent, trimmed', () => {
    // before
    const { result } = renderHook(() => useCommentDraftValue());

    // action
    act(() => {
      result.current.onInput(createInputEvent('  hello  '));
    });

    // result
    expect(result.current.value).toBe('hello');
  });

  it('should fall back to an empty value when textContent is null', () => {
    // mock
    const event = { currentTarget: { textContent: null } } as unknown as InputEvent<HTMLDivElement>;

    // before
    const { result } = renderHook(() => useCommentDraftValue());

    // action
    act(() => {
      result.current.onInput(event);
    });

    // result
    expect(result.current.value).toBe('');
  });
});
