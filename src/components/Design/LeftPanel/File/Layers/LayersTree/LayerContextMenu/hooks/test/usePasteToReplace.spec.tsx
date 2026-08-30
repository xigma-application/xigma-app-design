import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { usePasteToReplace } from '../usePasteToReplace';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { setClipboardNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clipboard';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('usePasteToReplace', () => {
  it("should overwrite the selected node's content with the clipboard copy when called", () => {
    // mock
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'Source', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    const [sourceId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    const sourceNode = selectActivePage(store.getState()).nodes[sourceId] as TFrameNode;
    setClipboardNodes([{ ...sourceNode, height: 40 }], [sourceId]);

    store.dispatch(
      addNode({ fill: '#0000ff', height: 10, name: 'Target', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 5, y: 5 }),
    );
    const [targetId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([targetId]));

    // before
    const { result } = renderHook(() => usePasteToReplace(), { wrapper });

    // action
    result.current();

    // result — same id and position, height taken from the clipboard copy
    const target = selectActivePage(store.getState()).nodes[targetId];
    expect(target).toMatchObject({ height: 40, id: targetId, x: 5, y: 5 });
  });
});
