import { MouseEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSelectFillRow } from '../useSelectFillRow';

const createEvent = (target: HTMLElement, overrides: Partial<MouseEvent<HTMLDivElement>> = {}): MouseEvent<HTMLDivElement> =>
  ({ ctrlKey: false, metaKey: false, shiftKey: false, target, ...overrides }) as unknown as MouseEvent<HTMLDivElement>;

describe('useSelectFillRow behaviors', () => {
  it('should call onSelect with meta/shift flags derived from the event', () => {
    // mock
    const onSelect = vi.fn();
    const event = createEvent(document.createElement('div'), { metaKey: true });

    // before
    const { result } = renderHook(() => useSelectFillRow(onSelect));

    // action
    result.current(event);

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: false });
  });

  it('should treat ctrlKey the same as metaKey', () => {
    // mock
    const onSelect = vi.fn();
    const event = createEvent(document.createElement('div'), { ctrlKey: true, shiftKey: true });

    // before
    const { result } = renderHook(() => useSelectFillRow(onSelect));

    // action
    result.current(event);

    // result
    expect(onSelect).toHaveBeenCalledWith({ meta: true, shift: true });
  });

  it('should not select the row when the click target is inside a data-no-select area', () => {
    // mock
    const onSelect = vi.fn();
    const wrapper = document.createElement('div');

    wrapper.setAttribute('data-no-select', '');

    const input = document.createElement('input');

    wrapper.appendChild(input);

    // before
    const { result } = renderHook(() => useSelectFillRow(onSelect));

    // action
    result.current(createEvent(input));

    // result
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should not select the row when the click target is inside a portalled Radix popover, even though it is not a real DOM descendant of the row', () => {
    // mock — a Radix popover's content is rendered through a portal, so this node has no real DOM
    // relationship to the row at all; it only reaches this handler via React's cross-portal bubbling
    const onSelect = vi.fn();
    const popperWrapper = document.createElement('div');

    popperWrapper.setAttribute('data-radix-popper-content-wrapper', '');

    const option = document.createElement('button');

    popperWrapper.appendChild(option);

    // before
    const { result } = renderHook(() => useSelectFillRow(onSelect));

    // action
    result.current(createEvent(option));

    // result
    expect(onSelect).not.toHaveBeenCalled();
  });
});
