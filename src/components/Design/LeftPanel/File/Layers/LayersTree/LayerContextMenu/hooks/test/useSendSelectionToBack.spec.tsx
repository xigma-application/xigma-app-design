import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useSendSelectionToBack } from '../useSendSelectionToBack';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useSendSelectionToBack', () => {
  it('should move the selected node to the back of its container when called', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    const [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
    store.dispatch(setSelection([idB]));

    // before
    const { result } = renderHook(() => useSendSelectionToBack(), { wrapper });

    // action
    result.current();

    // result — idB now sits before idA (moved to the back)
    const { rootOrder } = selectActivePage(store.getState());
    expect(rootOrder.indexOf(idB)).toBeLessThan(rootOrder.indexOf(idA));
    expect(rootOrder.indexOf(idB)).toBe(0);
  });
});
