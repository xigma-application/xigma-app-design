import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useFileMenuPlaceImageClick } from '../useFileMenuPlaceImageClick';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// store
import { selectActiveTool } from 'store/design/selectors';
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const refs = createCanvasRefs({ canvasRef: { current: document.createElement('canvas') } });

const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
  <Provider store={store}>
    <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
  </Provider>
);

describe('useFileMenuPlaceImageClick', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should activate the media tool when called', () => {
    // before
    const { result } = renderHook(() => useFileMenuPlaceImageClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectActiveTool(store.getState())).toBe(ToolName.media);
  });
});
