import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { usePaintColorPickerValue } from '../usePaintColorPickerValue';

// store
import { setPaintColor } from 'store/design/slice';
import { DEFAULT_PAINT_COLOR } from 'store/design/constants';
import { store } from 'store';

const renderUsePaintColorPickerValue = (): ReturnType<typeof renderHook<ReturnType<typeof usePaintColorPickerValue>, unknown>> =>
  renderHook(() => usePaintColorPickerValue(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('usePaintColorPickerValue', () => {
  beforeEach(() => {
    store.dispatch(setPaintColor(DEFAULT_PAINT_COLOR));
  });

  it('should expose the store hex with a full-opacity alpha by default', () => {
    // before
    const { result } = renderUsePaintColorPickerValue();

    // result
    expect(result.current.value).toStrictEqual({ alpha: 100, hex: DEFAULT_PAINT_COLOR });
  });

  it('should dispatch the hex and keep the picked alpha locally on change', () => {
    // before
    const { result } = renderUsePaintColorPickerValue();

    // action
    act(() => result.current.onChange({ alpha: 40, hex: '#ff0000' }));

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paintColor).toBe('#ff0000');
    expect(result.current.value).toStrictEqual({ alpha: 40, hex: '#ff0000' });
  });
});
