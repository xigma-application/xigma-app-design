import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSeedEditableTextOnEntry } from '../useSeedEditableTextOnEntry';

// store
import designReducer from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createElementRef = (): RefObject<HTMLDivElement | null> => {
  const element = document.createElement('div');

  element.setAttribute('contenteditable', 'true');
  element.setAttribute('tabindex', '0');
  document.body.appendChild(element);

  return { current: element };
};

const renderWithStore = (
  store: EnhancedStore<{ design: TDesignState }>,
  ...args: Parameters<typeof useSeedEditableTextOnEntry>
): ReturnType<typeof renderHook> =>
  renderHook(() => useSeedEditableTextOnEntry(...args), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useSeedEditableTextOnEntry behaviors', () => {
  it('should do nothing when there is no box being edited', () => {
    // mock
    const elementRef = createElementRef();

    // before
    renderWithStore(createTestStore(), elementRef, null, null, '');

    // result
    expect(elementRef.current).not.toHaveFocus();
  });

  it('should just focus the element for a brand-new (non-existing-node) edit session', () => {
    // mock
    const elementRef = createElementRef();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    renderWithStore(createTestStore(), elementRef, box, null, '');

    // result
    expect(elementRef.current).toHaveFocus();
    expect(elementRef.current?.textContent).toBe('');
  });

  it('should seed the existing content and select all of it when editing an existing node', () => {
    // mock
    const store = createTestStore();
    const elementRef = createElementRef();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    renderWithStore(store, elementRef, box, 'node-1', 'hello');

    // result
    expect(elementRef.current?.textContent).toBe('hello');
    expect(elementRef.current).toHaveFocus();
    expect(window.getSelection()?.toString()).toBe('hello');
    expect(store.getState().design.editingSelectionStart).toBe(0);
    expect(store.getState().design.editingSelectionEnd).toBe(5);
  });

  it('should not re-seed, re-focus, or re-select on a later render with the same box, even as content changes', () => {
    // mock
    const elementRef = createElementRef();
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

    const { rerender } = renderHook(({ content }) => useSeedEditableTextOnEntry(elementRef, box, 'node-1', content), {
      initialProps: { content: 'hello' },
      wrapper: ({ children }) => <Provider store={createTestStore()}>{children}</Provider>,
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
    const firstBox = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };
    const secondBox = { flipX: false, flipY: false, height: 30, rotation: 0, width: 200, x: 10, y: 10 };

    const { rerender } = renderHook(({ box, content }) => useSeedEditableTextOnEntry(elementRef, box, 'node-1', content), {
      initialProps: { box: firstBox, content: 'first' },
      wrapper: ({ children }) => <Provider store={createTestStore()}>{children}</Provider>,
    });

    // action
    rerender({ box: secondBox, content: 'second' });

    // result
    expect(elementRef.current?.textContent).toBe('second');
  });
});
