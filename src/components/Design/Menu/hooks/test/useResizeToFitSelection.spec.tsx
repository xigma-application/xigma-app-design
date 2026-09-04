import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useResizeToFitSelection } from '../useResizeToFitSelection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useResizeToFitSelection', () => {
  it('should resize the selected frame around its children when called', () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 10,
        y: 10,
      }),
    );
    const [childId] = selectActivePage(store.getState()).rootOrder.slice(-1);

    store.dispatch(
      addNode({
        childIds: [childId],
        clipContent: true,
        fill: '#ff0000',
        height: 200,
        name: 'Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 200,
        x: 0,
        y: 0,
      }),
    );
    const [frameId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([frameId]));

    // before
    const { result } = renderHook(() => useResizeToFitSelection(), { wrapper });

    // action
    result.current();

    // result
    const frame = selectNodes(store.getState())[frameId] as TFrameNode;
    expect(frame.x).toBe(10);
    expect(frame.y).toBe(10);
    expect(frame.width).toBe(20);
    expect(frame.height).toBe(20);
  });
});
