import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import LayerContextMenu from './LayerContextMenu';

// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getClipboardNodes, setClipboardNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clipboard';

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const renderLayerContextMenu = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <LayerContextMenu
        anchorRef={anchorRef}
        isHidden={false}
        isLocked={false}
        isOpen
        onOpenChange={vi.fn()}
        onRenameRequested={vi.fn()}
        onToggleHidden={vi.fn()}
        onToggleLocked={vi.fn()}
      />
    </Provider>,
  );

describe('LayerContextMenu', () => {
  it('should group the selected nodes into a group node on Group selection click', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'B', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    const [idA, idB] = selectActivePage(store.getState()).rootOrder.slice(-2);
    store.dispatch(setSelection([idA, idB]));

    // before
    renderLayerContextMenu();

    // action
    await user.click(screen.getByText('Group selection'));

    // result
    const page = selectActivePage(store.getState());
    const [groupId] = page.selectedIds;
    expect(page.nodes[groupId].type).toBe(NodeType.group);

    // after
    store.dispatch(deleteNode(groupId));
  });

  it('should copy the selected node into the clipboard on Copy click', async () => {
    // mock
    const user = userEvent.setup();
    setClipboardNodes([], []);
    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );
    const [idA] = selectActivePage(store.getState()).rootOrder.slice(-1);
    store.dispatch(setSelection([idA]));

    // before
    renderLayerContextMenu();

    // action
    await user.click(screen.getByText('Copy'));

    // result
    expect(getClipboardNodes().rootIds).toEqual([idA]);

    // after
    store.dispatch(deleteNode(idA));
  });
});
