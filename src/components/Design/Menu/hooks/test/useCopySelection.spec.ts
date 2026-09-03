import { renderHook } from '@testing-library/react';

// hooks
import { useCopySelection } from '../useCopySelection';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getClipboardNodes, setClipboardNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clipboard';

describe('useCopySelection', () => {
  it('should copy the selected nodes into the clipboard when called', () => {
    // mock
    setClipboardNodes([], []);
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fill: '#ff0000',
        height: 10,
        name: 'A',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    const [idA] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([idA]));

    // before
    const { result } = renderHook(() => useCopySelection());

    // action
    result.current();

    // result
    expect(getClipboardNodes().rootIds).toEqual([idA]);
  });
});
