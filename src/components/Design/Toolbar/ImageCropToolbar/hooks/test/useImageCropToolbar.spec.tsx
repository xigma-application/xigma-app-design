import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';

// hooks
import { useImageCropToolbar } from '../useImageCropToolbar';

// store
import { setImageEditor } from 'store/design/slice';
import { store } from 'store';

// others
import { ZOOM_SLIDER_DEFAULT } from '../../constants';

const renderUseImageCropToolbar = (): ReturnType<typeof renderHook<ReturnType<typeof useImageCropToolbar>, unknown>> =>
  renderHook(() => useImageCropToolbar(), { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> });

describe('useImageCropToolbar', () => {
  afterEach(() => {
    store.dispatch(setImageEditor(null));
  });

  it('should stay hidden when there is no active image editor', () => {
    expect(renderUseImageCropToolbar().result.current.isVisible).toBe(false);
  });

  it('should stay hidden while the editor is active but not in crop mode', () => {
    store.dispatch(setImageEditor({ mode: 'position', nodeId: 'node-1', paintIndex: 0 }));

    expect(renderUseImageCropToolbar().result.current.isVisible).toBe(false);

    store.dispatch(setImageEditor({ mode: 'tile', nodeId: 'node-1', paintIndex: 0 }));

    expect(renderUseImageCropToolbar().result.current.isVisible).toBe(false);
  });

  it('should show up once crop mode is active', () => {
    store.dispatch(setImageEditor({ mode: 'crop', nodeId: 'node-1', paintIndex: 0 }));

    expect(renderUseImageCropToolbar().result.current.isVisible).toBe(true);
  });

  it('should expose a local zoom value, starting at the default, with no store side effect', () => {
    const { result } = renderUseImageCropToolbar();

    expect(result.current.zoom).toBe(ZOOM_SLIDER_DEFAULT);

    act(() => result.current.onZoomChange(80));

    expect(result.current.zoom).toBe(80);
  });
});
