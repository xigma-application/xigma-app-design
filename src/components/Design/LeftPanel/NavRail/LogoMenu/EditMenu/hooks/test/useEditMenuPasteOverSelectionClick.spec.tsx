import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { useEditMenuPasteOverSelectionClick } from '../useEditMenuPasteOverSelectionClick';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { setClipboardNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clipboard';

describe('useEditMenuPasteOverSelectionClick', () => {
  it('should add a fresh copy at the selected target while leaving it in place', () => {
    // mock
    const refs = createCanvasRefs();

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
        x: 5,
        y: 5,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const sourceId = rootOrder[rootOrder.length - 1];
    const sourceNode = selectActivePage(store.getState()).nodes[sourceId];
    setClipboardNodes([sourceNode], [sourceId]);

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
        x: 50,
        y: 50,
      }),
    );

    const targetId = selectActivePage(store.getState()).rootOrder.at(-1) as string;
    store.dispatch(setSelection([targetId]));
    const nodeCountBefore = Object.keys(selectActivePage(store.getState()).nodes).length;

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <Provider store={store}>
        <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>
      </Provider>
    );

    // before
    const { result } = renderHook(() => useEditMenuPasteOverSelectionClick(), { wrapper });

    // action
    result.current();

    // result — the target is untouched, a new node landed at its position
    const page = selectActivePage(store.getState());
    expect(page.nodes[targetId]).toMatchObject({ x: 50, y: 50 });
    expect(Object.keys(page.nodes)).toHaveLength(nodeCountBefore + 1);
  });
});
