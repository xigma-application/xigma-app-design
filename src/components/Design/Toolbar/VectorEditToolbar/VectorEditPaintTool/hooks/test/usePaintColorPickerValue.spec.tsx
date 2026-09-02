import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';

// hooks
import { usePaintColorPickerValue } from '../usePaintColorPickerValue';

// store
import { DEFAULT_PAINT } from 'store/design/constants';
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
});
