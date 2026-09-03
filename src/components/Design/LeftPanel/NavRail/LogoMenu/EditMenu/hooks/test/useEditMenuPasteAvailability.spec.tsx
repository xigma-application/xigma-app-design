import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// hooks
import { useEditMenuPasteAvailability } from '../useEditMenuPasteAvailability';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { setClipboardNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clipboard';

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>;

describe('useEditMenuPasteAvailability', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    setClipboardNodes([], []);
  });

  it('should return false when nothing is selected, even with a compatible clipboard', () => {
    // mock
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
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    setClipboardNodes([selectActivePage(store.getState()).nodes[rootOrder[0]]], [rootOrder[0]]);

    // action
    const { result } = renderHook(() => useEditMenuPasteAvailability(), { wrapper });

    // result
    expect(result.current).toBe(false);
  });

  it('should return false when a target is selected but the clipboard is empty', () => {
    // mock
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
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    store.dispatch(setSelection([rootOrder[0]]));

    // action
    const { result } = renderHook(() => useEditMenuPasteAvailability(), { wrapper });

    // result
    expect(result.current).toBe(false);
  });

  it('should return true when a target is selected and the clipboard holds a single compatible root', () => {
    // mock
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
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const nodeId = rootOrder[0];
    setClipboardNodes([selectActivePage(store.getState()).nodes[nodeId]], [nodeId]);
    store.dispatch(setSelection([nodeId]));

    // action
    const { result } = renderHook(() => useEditMenuPasteAvailability(), { wrapper });

    // result
    expect(result.current).toBe(true);
  });
});
