import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useBringSelectionToFront } from '../useBringSelectionToFront';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useBringSelectionToFront', () => {
  it('should move the selected node to the front of its container when called', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    const [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
    store.dispatch(setSelection([idA]));

    // before
    const { result } = renderHook(() => useBringSelectionToFront(), { wrapper });

    // action
    result.current();

    // result — idA now sits after idB (moved to the front)
    const { rootOrder } = selectActivePage(store.getState());
    expect(rootOrder.indexOf(idA)).toBeGreaterThan(rootOrder.indexOf(idB));
    expect(rootOrder.indexOf(idA)).toBe(rootOrder.length - 1);
  });
});
