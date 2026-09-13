import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react';

// hooks
import { useSetGradientPaint } from './useSetGradientPaint';

// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setPaint } from 'store/design/slice';
import { store } from 'store';

// types
import { BlendMode } from 'types/design/enums';

const renderUseSetGradientPaint = (): ReturnType<typeof renderHook<ReturnType<typeof useSetGradientPaint>, unknown>> =>
  renderHook(() => useSetGradientPaint(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useSetGradientPaint', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_PAINT));
  });

  it('should dispatch a gradient paint built from the stops, type, and angle', () => {
    // before
    const { result } = renderUseSetGradientPaint();

    // action
    result.current({
      angle: 0,
      stops: [
        { color: '#ffffff', id: 'a', opacity: 100, position: 0 },
        { color: '#000000', id: 'b', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    });

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paint).toEqual({
      blendMode: undefined,
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    });
  });

  it('should preserve the current blend mode when switching to a gradient', () => {
    // mock
    store.dispatch(setPaint({ ...DEFAULT_PAINT, blendMode: BlendMode.multiply }));

    // before
    const { result } = renderUseSetGradientPaint();

    // action
    result.current({ angle: 90, stops: [], type: 'gradient-radial' });

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paint.blendMode).toBe(BlendMode.multiply);
  });
});
