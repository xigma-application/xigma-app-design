import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useConvertSelectionToFrame } from '../useConvertSelectionToFrame';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useConvertSelectionToFrame', () => {
  it('should convert the selected section into a frame when called', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, type: NodeType.section, width: 10, x: 0, y: 0 }),
    );
    const [sectionId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([sectionId]));

    // before
    const { result } = renderHook(() => useConvertSelectionToFrame(), { wrapper });

    // action
    result.current();

    // result
    expect(selectActivePage(store.getState()).nodes[sectionId].type).toBe(NodeType.frame);
  });
});
