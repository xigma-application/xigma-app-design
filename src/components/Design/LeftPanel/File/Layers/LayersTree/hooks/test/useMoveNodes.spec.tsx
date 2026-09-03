import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useMoveNodes } from '../useMoveNodes';

// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useMoveNodes', () => {
  it('should dispatch moveNodes with the given payload', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'B', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );

    const rootOrderBefore = selectActivePage(store.getState()).rootOrder;
    const [firstId] = rootOrderBefore.slice(-2);

    // before
    const { result } = renderHook(() => useMoveNodes(), { wrapper });

    // action
    result.current({ nodeIds: [firstId], targetIndex: rootOrderBefore.length, targetParentId: null });

    // result
    const rootOrderAfter = selectActivePage(store.getState()).rootOrder;
    expect(rootOrderAfter.at(-1)).toBe(firstId);
  });
});
