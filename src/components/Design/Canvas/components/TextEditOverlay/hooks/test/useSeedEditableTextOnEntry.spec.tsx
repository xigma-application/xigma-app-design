import { RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSeedEditableTextOnEntry } from '../useSeedEditableTextOnEntry';

const createElementRef = (): RefObject<HTMLDivElement | null> => {
  const element = document.createElement('div');

  element.setAttribute('contenteditable', 'true');
  element.setAttribute('tabindex', '0');
  document.body.appendChild(element);

  return { current: element };
};

describe('useSeedEditableTextOnEntry behaviors', () => {
  it('should do nothing when there is no box being edited', () => {
    // mock
    const elementRef = createElementRef();

    // before
    renderHook(() => useSeedEditableTextOnEntry(elementRef, null, null, ''));

    // result
    expect(elementRef.current).not.toHaveFocus();
  });

  it('should just focus the element for a brand-new (non-existing-node) edit session', () => {
    // mock
    const elementRef = createElementRef();
    const box = { height: 20, width: 100, x: 0, y: 0 };

    // before
    renderHook(() => useSeedEditableTextOnEntry(elementRef, box, null, ''));

    // result
    expect(elementRef.current).toHaveFocus();
    expect(elementRef.current?.textContent).toBe('');
  });

  it('should seed the existing content and select all of it when editing an existing node', () => {
    // mock
    const elementRef = createElementRef();
    const box = { height: 20, width: 100, x: 0, y: 0 };

    // before
    renderHook(() => useSeedEditableTextOnEntry(elementRef, box, 'node-1', 'hello'));

    // result
    expect(elementRef.current?.textContent).toBe('hello');
    expect(elementRef.current).toHaveFocus();
    expect(window.getSelection()?.toString()).toBe('hello');
  });

  it('should not re-seed, re-focus, or re-select on a later render with the same box, even as content changes', () => {
    // mock
    const elementRef = createElementRef();
    const box = { height: 20, width: 100, x: 0, y: 0 };

    const { rerender } = renderHook(({ content }) => useSeedEditableTextOnEntry(elementRef, box, 'node-1', content), {
      initialProps: { content: 'hello' },
    });

    // action — simulate further typing: DOM content now diverges from the originally seeded value
    elementRef.current!.textContent = 'hello world';
    rerender({ content: 'hello world' });

    // result — the effect must not have reset textContent back on the second render
    expect(elementRef.current?.textContent).toBe('hello world');
  });

  it('should re-seed and re-select when a new edit session starts on a different box', () => {
    // mock
    const elementRef = createElementRef();
    const firstBox = { height: 20, width: 100, x: 0, y: 0 };
    const secondBox = { height: 30, width: 200, x: 10, y: 10 };

    const { rerender } = renderHook(({ box, content }) => useSeedEditableTextOnEntry(elementRef, box, 'node-1', content), {
      initialProps: { box: firstBox, content: 'first' },
    });

    // action
    rerender({ box: secondBox, content: 'second' });

    // result
    expect(elementRef.current?.textContent).toBe('second');
  });
});
