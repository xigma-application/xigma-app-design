import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnBackgroundColor } from '../useColumnBackgroundColor';

// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setPaint } from 'store/design/slice';
import { store } from 'store';

// types
import { TSolidPaint } from 'types/design/paint/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnBackgroundColor = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnBackgroundColor>, unknown>> =>
  renderHook(() => useColumnBackgroundColor(), { wrapper });

const readPaint = (): TSolidPaint => store.getState().design.pages[store.getState().design.activePageId].paint;

describe('useColumnBackgroundColor', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_PAINT));
  });

  it('should expose the current page paint as hex, alpha, and a visible flag', () => {
    // before
    const { result } = renderUseColumnBackgroundColor();

    // result
    expect(result.current).toMatchObject({ alpha: DEFAULT_PAINT.opacity, hex: DEFAULT_PAINT.color, isVisible: true });
  });

  it('should report isVisible false when the paint is explicitly hidden', () => {
    // mock
    store.dispatch(setPaint({ ...DEFAULT_PAINT, visible: false }));

    // before
    const { result } = renderUseColumnBackgroundColor();

    // result
    expect(result.current.isVisible).toBe(false);
  });

  it('should commit a new hex while keeping the other paint fields', () => {
    // before
    const { result } = renderUseColumnBackgroundColor();

    // action
    act(() => result.current.onCommitHex('#123456'));

    // result
    expect(readPaint()).toEqual({ color: '#123456', opacity: 100, type: 'solid' });
  });

  it('should commit a new opacity while keeping the other paint fields', () => {
    // before
    const { result } = renderUseColumnBackgroundColor();

    // action
    act(() => result.current.onCommitAlpha(30));

    // result
    expect(readPaint()).toEqual({ color: DEFAULT_PAINT.color, opacity: 30, type: 'solid' });
  });

  it('should apply both colour and opacity together from a picker change', () => {
    // before
    const { result } = renderUseColumnBackgroundColor();

    // action
    act(() => result.current.onPickerChange({ alpha: 42, hex: '#abcdef' }));

    // result
    expect(readPaint()).toEqual({ color: '#abcdef', opacity: 42, type: 'solid' });
  });

  it('should hide a currently visible background on toggle', () => {
    // before
    const { result } = renderUseColumnBackgroundColor();

    // action
    act(() => result.current.onToggleVisibility());

    // result
    expect(readPaint().visible).toBe(false);
  });

  it('should re-show a hidden background on toggle', () => {
    // mock
    store.dispatch(setPaint({ ...DEFAULT_PAINT, visible: false }));

    // before
    const { result } = renderUseColumnBackgroundColor();

    // action
    act(() => result.current.onToggleVisibility());

    // result
    expect(readPaint().visible).toBe(true);
  });
});
