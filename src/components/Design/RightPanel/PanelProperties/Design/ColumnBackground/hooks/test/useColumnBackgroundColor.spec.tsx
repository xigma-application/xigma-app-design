import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';

// hooks
import { useColumnBackgroundColor } from '../useColumnBackgroundColor';

// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setBackgroundPaint } from 'store/design/slice';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { TSolidPaint } from 'types/design/paint/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

const renderUseColumnBackgroundColor = (): ReturnType<typeof renderHook<ReturnType<typeof useColumnBackgroundColor>, unknown>> =>
  renderHook(() => useColumnBackgroundColor(), { wrapper });

const readPaint = (): TSolidPaint => store.getState().design.pages[store.getState().design.activePageId].backgroundPaint;

describe('useColumnBackgroundColor', () => {
  beforeEach(() => {
    store.dispatch(setBackgroundPaint(DEFAULT_PAINT));
  });

  it('should expose the current page paint as hex, alpha, and a visible flag', () => {
    // before
    const { result } = renderUseColumnBackgroundColor();

    // result
    expect(result.current).toMatchObject({ alpha: DEFAULT_PAINT.opacity, hex: DEFAULT_PAINT.color, isVisible: true });
  });

  it('should report isVisible false when the paint is explicitly hidden', () => {
    // mock
    store.dispatch(setBackgroundPaint({ ...DEFAULT_PAINT, visible: false }));

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
    store.dispatch(setBackgroundPaint({ ...DEFAULT_PAINT, visible: false }));

    // before
    const { result } = renderUseColumnBackgroundColor();

    // action
    act(() => result.current.onToggleVisibility());

    // result
    expect(readPaint().visible).toBe(true);
  });

  it('should coalesce every opacity commit dispatched between onDragStart and onDragEnd into a single undo step', () => {
    // before
    const { result } = renderUseColumnBackgroundColor();

    // action — simulates the alpha scrubber firing onChange repeatedly during one drag gesture
    act(() => {
      result.current.onDragStart();
      result.current.onCommitAlpha(80);
      result.current.onCommitAlpha(60);
      result.current.onCommitAlpha(40);
      result.current.onDragEnd();
    });

    expect(readPaint().opacity).toBe(40);

    // action
    store.dispatch(undo());

    // result — one undo step restores the pre-drag opacity, not just the last drag-step
    expect(readPaint().opacity).toBe(DEFAULT_PAINT.opacity);
  });
});
