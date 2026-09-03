import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useConvertSelectionToSection } from '../useConvertSelectionToSection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useConvertSelectionToSection', () => {
  it('should convert the selected frame into a section when called', () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, childIds: [], clipContent: true, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    const [frameId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderHook(() => useConvertSelectionToSection(), { wrapper });

    // action
    result.current();

    // result
    expect(selectActivePage(store.getState()).nodes[frameId].type).toBe(NodeType.section);
  });
});
