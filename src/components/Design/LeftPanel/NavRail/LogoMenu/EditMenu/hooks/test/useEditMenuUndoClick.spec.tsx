import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useEditMenuUndoClick } from '../useEditMenuUndoClick';

// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

describe('useEditMenuUndoClick', () => {
  it('should step the last design change back when called', () => {
    // mock
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
    const refs = createCanvasRefs({ canvasRef: { current: canvas } });

    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 20,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 20,
        x: 0,
        y: 0,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <Provider store={store}>
        <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
      </Provider>
    );

    // before
    const { result } = renderHook(() => useEditMenuUndoClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeUndefined();
  });
});
