import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

// components
import LayerContextMenu from './LayerContextMenu';

// store
import { addNode, addPage, deleteNode, deletePage, setActivePage, setSelection } from 'store/design/slice';
import { selectActivePage, selectActivePageId } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getClipboardNodes, setClipboardNodes } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/clipboard';

const anchorRef = { current: { getBoundingClientRect: (): DOMRect => new DOMRect(10, 20, 0, 0) } };

const menuNode: TFrameNode = {
  fill: '#000000',
  height: 10,
  id: 'menu-node',
  name: 'Node',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
};

const renderLayerContextMenu = (node: TSceneNode = menuNode): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <LayerContextMenu
        anchorRef={anchorRef}
        isOpen
        node={node}
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

  it("should overwrite the selected node's content with the clipboard copy on Paste to replace click", async () => {
    // mock
    const user = userEvent.setup();
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
    renderLayerContextMenu();

    // action
    await user.click(screen.getByText('Paste to replace'));

    // result
    expect(selectActivePage(store.getState()).nodes[targetId]).toMatchObject({ height: 40, id: targetId, x: 5, y: 5 });

    // after
    store.dispatch(deleteNode(sourceId));
    store.dispatch(deleteNode(targetId));
  });

  it('should move the selected node to another page via the "Move to page" submenu', () => {
    // mock
    vi.useFakeTimers();
    const firstPageId = selectActivePageId(store.getState());

    store.dispatch(
      addNode({ fill: '#ff0000', height: 10, name: 'A', parentId: null, rotation: 0, type: NodeType.frame, width: 10, x: 0, y: 0 }),
    );

    const [idA] = selectActivePage(store.getState()).rootOrder.slice(-1);

    store.dispatch(setSelection([idA]));
    store.dispatch(addPage());

    const secondPageId = selectActivePageId(store.getState());

    store.dispatch(setActivePage(firstPageId));

    // before
    renderLayerContextMenu();

    // action
    fireEvent.pointerEnter(screen.getByText('Move to page'));
    act(() => vi.runAllTimers());
    fireEvent.click(screen.getByText(store.getState().design.pages[secondPageId].name));

    // result
    expect(store.getState().design.pages[firstPageId].nodes[idA]).toBeUndefined();
    expect(store.getState().design.pages[secondPageId].nodes[idA]).toBeDefined();

    // after
    store.dispatch(setActivePage(secondPageId));
    store.dispatch(deleteNode(idA));
    store.dispatch(setActivePage(firstPageId));
    store.dispatch(deletePage(secondPageId));
    vi.useRealTimers();
  });

  it('should replace a rectangle with its vector equivalent on Flatten click', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(
      addNode({ fill: '#ff0000', height: 20, name: 'Rect', parentId: null, rotation: 0, type: NodeType.rectangle, width: 20, x: 0, y: 0 }),
    );
    const [rectId] = selectActivePage(store.getState()).rootOrder.slice(-1);
    const rectNode = selectActivePage(store.getState()).nodes[rectId];
    store.dispatch(setSelection([rectId]));

    // before
    renderLayerContextMenu(rectNode);

    // action
    await user.click(screen.getByText('Flatten'));

    // result — the click handler is fire-and-forget, so the store update lands asynchronously
    await waitFor(() => expect(selectActivePage(store.getState()).nodes[rectId].type).toBe(NodeType.vector));

    // after
    store.dispatch(deleteNode(rectId));
  });

  it('should replace the original shape in place with a single vector combining its fill and stroke outline, on Outline stroke click', async () => {
    // mock
    const user = userEvent.setup();
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
    const rectNode = selectActivePage(store.getState()).nodes[rectId];
    store.dispatch(setSelection([rectId]));

    // before
    renderLayerContextMenu(rectNode);

    // action
    await user.click(screen.getByText('Outline stroke'));

    // result — no group: same id, now a vector with both the original fill face and the new
    // stroke-outline face; fire-and-forget, so this lands asynchronously
    await waitFor(() => {
      const node = selectActivePage(store.getState()).nodes[rectId];

      expect(node.type).toBe(NodeType.vector);
      expect(node.type === NodeType.vector ? node.filledFaceKeys.length : 0).toBeGreaterThanOrEqual(2);
      expect(node.type === NodeType.vector ? Object.values(node.fillColorOverrideByKey ?? {}) : []).toEqual(
        expect.arrayContaining(['#ff0000', '#000000']),
      );
    });

    // after
    store.dispatch(deleteNode(rectId));
  });
});
