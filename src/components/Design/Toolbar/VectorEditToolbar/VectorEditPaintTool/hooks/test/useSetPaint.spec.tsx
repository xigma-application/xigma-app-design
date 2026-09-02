import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSetPaint } from '../useSetPaint';

// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setPaint } from 'store/design/slice';
import { store } from 'store';

const renderUseSetPaint = (): ReturnType<typeof renderHook<ReturnType<typeof useSetPaint>, unknown>> =>
  renderHook(() => useSetPaint(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useSetPaint', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_PAINT));
  });

  it('should dispatch setPaint with a solid paint built from the picked hex and alpha when called', () => {
    // before
    const { result } = renderUseSetPaint();

    // action
    result.current({ alpha: 50, hex: '#ff0000' });

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paint).toEqual({
      color: '#ff0000',
      opacity: 50,
      type: 'solid',
    });
  });
});
