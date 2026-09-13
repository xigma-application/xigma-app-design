import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { usePaintColorPickerValue } from '../usePaintColorPickerValue';

// store
import { DEFAULT_PAINT, DEFAULT_VECTOR_PAINT } from 'store/design/constants';
import { setPaint } from 'store/design/slice';
import { store } from 'store';

const renderUsePaintColorPickerValue = (): ReturnType<typeof renderHook<ReturnType<typeof usePaintColorPickerValue>, unknown>> =>
  renderHook(() => usePaintColorPickerValue(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('usePaintColorPickerValue', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_PAINT));
  });

  it('should expose the store paint’s own color and opacity by default', () => {
    // before
    const { result } = renderUsePaintColorPickerValue();

    // result
    expect(result.current.value).toStrictEqual({ alpha: DEFAULT_PAINT.opacity, hex: DEFAULT_PAINT.color });
  });

  it('should dispatch the picked hex and alpha into the store as a solid paint, both persisted, not just the color', () => {
    // before
    const { result } = renderUsePaintColorPickerValue();

    // action
    act(() => result.current.onChange({ alpha: 40, hex: '#ff0000' }));

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paint).toEqual({
      color: '#ff0000',
      opacity: 40,
      type: 'solid',
    });
    expect(result.current.value).toStrictEqual({ alpha: 40, hex: '#ff0000' });
  });

  it('should fall back to the default vector paint color when the active paint is a gradient', () => {
    // mock
    store.dispatch(setPaint({ end: { x: 1, y: 0.5 }, opacity: 100, start: { x: 0, y: 0.5 }, stops: [], type: 'gradient-linear' }));

    // before
    const { result } = renderUsePaintColorPickerValue();

    // result
    expect(result.current.value).toStrictEqual({ alpha: DEFAULT_VECTOR_PAINT.opacity, hex: DEFAULT_VECTOR_PAINT.color });
  });

  it('should dispatch a gradient paint through onGradientChange', () => {
    // before
    const { result } = renderUsePaintColorPickerValue();

    // action
    act(() =>
      result.current.onGradientChange({
        angle: 0,
        stops: [{ color: '#ff0000', id: 'a', opacity: 100, position: 0 }],
        type: 'gradient-linear',
      }),
    );

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paint).toMatchObject({ type: 'gradient-linear' });
  });

  it('should expose onDragStart/onDragEnd to bracket a drag gesture, without making the vector paint tool color undoable', () => {
    // before
    const { result } = renderUsePaintColorPickerValue();

    // action
    act(() => {
      result.current.onDragStart();
      result.current.onChange({ alpha: 40, hex: '#ff0000' });
      result.current.onDragEnd();
    });

    // result — bracketing the gesture must not, by itself, turn setPaint into an undoable action
    expect(store.getState().design.pages[store.getState().design.activePageId].paint).toEqual({
      color: '#ff0000',
      opacity: 40,
      type: 'solid',
    });
  });
});
