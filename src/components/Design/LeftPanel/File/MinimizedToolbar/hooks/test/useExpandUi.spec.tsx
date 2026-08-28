import { Provider } from 'react-redux';
import { KeyboardEvent, ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useExpandUi } from '../useExpandUi';

// store
import { toggleUiMinimized } from 'store/design/slice';
import { store } from 'store';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useExpandUi', () => {
  const initialIsUiMinimized = store.getState().design.isUiMinimized;

  afterEach(() => {
    if (store.getState().design.isUiMinimized !== initialIsUiMinimized) {
      store.dispatch(toggleUiMinimized());
    }
  });

  it('should toggle isUiMinimized when handleClick is called', () => {
    // before
    const { result } = renderHook(() => useExpandUi(), { wrapper });
    const wasMinimized = store.getState().design.isUiMinimized;

    // action
    result.current.handleClick();

    // result
    expect(store.getState().design.isUiMinimized).toBe(!wasMinimized);
  });

  it('should toggle isUiMinimized on Enter', () => {
    // before
    const { result } = renderHook(() => useExpandUi(), { wrapper });
    const wasMinimized = store.getState().design.isUiMinimized;
    const preventDefault = vi.fn();

    // action
    result.current.handleKeyDown({ key: 'Enter', preventDefault } as unknown as KeyboardEvent<HTMLElement>);

    // result
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(store.getState().design.isUiMinimized).toBe(!wasMinimized);
  });

  it('should toggle isUiMinimized on Space', () => {
    // before
    const { result } = renderHook(() => useExpandUi(), { wrapper });
    const wasMinimized = store.getState().design.isUiMinimized;
    const preventDefault = vi.fn();

    // action
    result.current.handleKeyDown({ key: ' ', preventDefault } as unknown as KeyboardEvent<HTMLElement>);

    // result
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(store.getState().design.isUiMinimized).toBe(!wasMinimized);
  });

  it('should not toggle isUiMinimized on other keys', () => {
    // before
    const { result } = renderHook(() => useExpandUi(), { wrapper });
    const wasMinimized = store.getState().design.isUiMinimized;
    const preventDefault = vi.fn();

    // action
    result.current.handleKeyDown({ key: 'Tab', preventDefault } as unknown as KeyboardEvent<HTMLElement>);

    // result
    expect(preventDefault).not.toHaveBeenCalled();
    expect(store.getState().design.isUiMinimized).toBe(wasMinimized);
  });
});
