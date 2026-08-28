import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSetPaintColor } from '../useSetPaintColor';

// store
import { setPaintColor } from 'store/design/slice';
import { DEFAULT_PAINT_COLOR } from 'store/design/constants';
import { store } from 'store';

const renderUseSetPaintColor = (): ReturnType<typeof renderHook<ReturnType<typeof useSetPaintColor>, unknown>> =>
  renderHook(() => useSetPaintColor(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useSetPaintColor', () => {
  beforeEach(() => {
    store.dispatch(setPaintColor(DEFAULT_PAINT_COLOR));
  });

  it('should dispatch setPaintColor with the picked value hex when called', () => {
    // before
    const { result } = renderUseSetPaintColor();

    // action
    result.current({ alpha: 100, hex: '#ff0000' });

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paintColor).toBe('#ff0000');
  });
});
