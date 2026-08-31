import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';

// hooks
import { useOutlineStrokeSelection } from '../useOutlineStrokeSelection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useOutlineStrokeSelection', () => {
  it('should replace the selected stroked node in place with its outlined vector when called', async () => {
    // mock
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 20,
        name: 'Rect',
        parentId: null,
        rotation: 0,
        strokeColor: '#000000',
        strokeWidth: 4,
        type: NodeType.rectangle,
        width: 20,
        x: 0,
        y: 0,
      }),
    );
    const [rectId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([rectId]));

    // before
    const { result } = renderHook(() => useOutlineStrokeSelection(), { wrapper });

    // action — fire-and-forget, like a real onClick; the underlying work finishes asynchronously
    result.current();

    // result — no group: same id, now a vector combining the fill and the outlined stroke
    await waitFor(() => expect(selectActivePage(store.getState()).nodes[rectId].type).toBe(NodeType.vector));
  });
});
