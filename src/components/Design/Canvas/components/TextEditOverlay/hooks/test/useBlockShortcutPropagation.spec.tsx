import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { KeyboardEvent } from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useBlockShortcutPropagation } from '../useBlockShortcutPropagation';

// store
import designReducer from 'store/design/slice';
import { TDesignState } from 'store/design/types';

const createTestStore = (): EnhancedStore<{ design: TDesignState }> => configureStore({ reducer: { design: designReducer } });

const createEditableElement = (text: string): HTMLDivElement => {
  const element = document.createElement('div');
  const textNode = document.createTextNode(text);

  element.appendChild(textNode);
  document.body.appendChild(element);

  const range = document.createRange();

  range.setStart(textNode, 1);
  range.setEnd(textNode, 1);

  const selection = window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(range);

  return element;
};

const renderBlockShortcutPropagation = (
  store: EnhancedStore<{ design: TDesignState }>,
  box: Parameters<typeof useBlockShortcutPropagation>[0],
): ((event: KeyboardEvent<HTMLDivElement>) => void) => {
  const { result } = renderHook(() => useBlockShortcutPropagation(box), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  return result.current;
};

describe('useBlockShortcutPropagation behaviors', () => {
  it('should stop the event from propagating', () => {
    // mock
    const stopPropagation = vi.fn();
    const event = { key: 'r', stopPropagation } as unknown as KeyboardEvent<HTMLDivElement>;
    const handleKeyDown = renderBlockShortcutPropagation(createTestStore(), null);

    // action
    handleKeyDown(event);

    // result
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });

  it('should not intercept Enter when the box is not attached to a path', () => {
    // mock
    const preventDefault = vi.fn();
    const element = createEditableElement('ab');
    const event = {
      currentTarget: element,
      key: 'Enter',
      preventDefault,
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent<HTMLDivElement>;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };
    const handleKeyDown = renderBlockShortcutPropagation(createTestStore(), box);

    // action
    handleKeyDown(event);

    // result
    expect(preventDefault).not.toHaveBeenCalled();
    expect(element.textContent).toBe('ab');

    document.body.removeChild(element);
  });

  it('should insert a space instead of a newline when Enter is pressed while editing text on a path', () => {
    // mock
    const preventDefault = vi.fn();
    const element = createEditableElement('ab');
    const event = {
      currentTarget: element,
      key: 'Enter',
      preventDefault,
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent<HTMLDivElement>;
    const box = { flipX: false, flipY: false, height: 20, pathId: 'ellipse-1', rotation: 0, width: 100, x: 0, y: 0 };
    const store = createTestStore();
    const handleKeyDown = renderBlockShortcutPropagation(store, box);

    // action
    handleKeyDown(event);

    // result
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(element.textContent).toBe('a b');
    expect(store.getState().design.editingTextContent).toBe('a b');

    document.body.removeChild(element);
  });

  it('should not intercept other keys while editing text on a path', () => {
    // mock
    const preventDefault = vi.fn();
    const element = createEditableElement('ab');
    const event = {
      currentTarget: element,
      key: 'a',
      preventDefault,
      stopPropagation: vi.fn(),
    } as unknown as KeyboardEvent<HTMLDivElement>;
    const box = { flipX: false, flipY: false, height: 20, pathId: 'ellipse-1', rotation: 0, width: 100, x: 0, y: 0 };
    const handleKeyDown = renderBlockShortcutPropagation(createTestStore(), box);

    // action
    handleKeyDown(event);

    // result
    expect(preventDefault).not.toHaveBeenCalled();
    expect(element.textContent).toBe('ab');

    document.body.removeChild(element);
  });
});
