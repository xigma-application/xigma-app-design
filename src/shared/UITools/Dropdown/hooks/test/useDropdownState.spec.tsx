import { act, renderHook } from '@testing-library/react';

// hooks
import { useDropdownState } from '../useDropdownState';

const options = [
  { label: 'Hex', value: 'hex' },
  { label: 'RGB', value: 'rgb' },
  { label: 'CSS', value: 'css' },
];

const createKeyDownEvent = (key: string): React.KeyboardEvent<HTMLDivElement> =>
  ({ key, preventDefault: vi.fn() }) as unknown as React.KeyboardEvent<HTMLDivElement>;

describe('useDropdownState', () => {
  it('should start closed with the highlighted index at the current value', () => {
    // before
    const { result } = renderHook(() => useDropdownState(options, 'rgb', vi.fn()));

    // result
    expect(result.current.isOpen).toBe(false);
    expect(result.current.highlightedIndex).toBe(1);
  });

  it('should reset the highlighted index to the current value whenever the dropdown opens', () => {
    // before
    const { result } = renderHook(() => useDropdownState(options, 'css', vi.fn()));

    // action
    act(() => result.current.setHighlightedIndex(0));
    act(() => result.current.handleOpenChange(true));

    // result
    expect(result.current.isOpen).toBe(true);
    expect(result.current.highlightedIndex).toBe(2);
  });

  it('should move the highlighted index down on ArrowDown without selecting', () => {
    // mock
    const onSelect = vi.fn();

    // before
    const { result } = renderHook(() => useDropdownState(options, 'hex', onSelect));
    const event = createKeyDownEvent('ArrowDown');

    // action
    act(() => result.current.handleKeyDown(event));

    // result
    expect(result.current.highlightedIndex).toBe(1);
    expect(onSelect).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should clamp the highlighted index at the last option instead of wrapping', () => {
    // before
    const { result } = renderHook(() => useDropdownState(options, 'css', vi.fn()));

    // action
    act(() => result.current.handleKeyDown(createKeyDownEvent('ArrowDown')));

    // result
    expect(result.current.highlightedIndex).toBe(2);
  });

  it('should select the highlighted option and close the panel on Enter', () => {
    // mock
    const onSelect = vi.fn();

    // before
    const { result } = renderHook(() => useDropdownState(options, 'hex', onSelect));
    act(() => result.current.handleKeyDown(createKeyDownEvent('ArrowDown')));

    // action
    act(() => result.current.handleKeyDown(createKeyDownEvent('Enter')));

    // result
    expect(onSelect).toHaveBeenCalledWith('rgb');
    expect(result.current.isOpen).toBe(false);
  });

  it('should ignore unrelated keys', () => {
    // mock
    const onSelect = vi.fn();

    // before
    const { result } = renderHook(() => useDropdownState(options, 'hex', onSelect));
    const event = createKeyDownEvent('Tab');

    // action
    act(() => result.current.handleKeyDown(event));

    // result
    expect(onSelect).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
