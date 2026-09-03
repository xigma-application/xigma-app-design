import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useEditMenuDeleteClick } from '../useEditMenuDeleteClick';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

describe('useEditMenuDeleteClick', () => {
  it('should delete the selected node when called', () => {
    // mock
    const refs = createCanvasRefs();

    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[rootOrder.length - 1];

    store.dispatch(setSelection([nodeId]));

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <Provider store={store}>
        <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
      </Provider>
    );

    // before
    const { result } = renderHook(() => useEditMenuDeleteClick(), { wrapper });

    // action
    result.current();

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeUndefined();
  });
});
