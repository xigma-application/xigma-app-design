import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import TreeItem from './TreeItem';

// store
import { addNode, deleteNode, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const renderTreeItem = (isSelected: boolean, node: TFrameNode): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TreeItem isSelected={isSelected} node={node} />
    </Provider>,
  );

describe('TreeItem', () => {
  let node: TFrameNode;

  beforeEach(() => {
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'My Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    node = Object.values(selectNodes(store.getState())).at(-1) as TFrameNode;
  });

  afterEach(() => {
    store.dispatch(deleteNode(node.id));
    store.dispatch(setSelection([]));
  });

  it('should render the node name', () => {
    // before
    renderTreeItem(false, node);

    // result
    expect(screen.getByText('My Frame')).toBeInTheDocument();
  });

  it('should mark the row as selected when isSelected is true', () => {
    // before
    const { container } = renderTreeItem(true, node);

    // result
    expect(container.querySelector('[aria-selected="true"]')).toBeInTheDocument();
  });

  it('should not mark the row as selected when isSelected is false', () => {
    // before
    const { container } = renderTreeItem(false, node);

    // result
    expect(container.querySelector('[aria-selected="true"]')).not.toBeInTheDocument();
  });

  it('should dispatch setSelection with the node id when the row is clicked', () => {
    // before
    renderTreeItem(false, node);

    // action
    fireEvent.click(screen.getByText('My Frame'));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([node.id]);
  });

  it('should dispatch toggleNodeHidden when the hide button is clicked', () => {
    // before
    renderTreeItem(false, node);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Hide layer' }));

    // result
    expect(selectNodes(store.getState())[node.id].hidden).toBe(true);
  });

  it('should dispatch toggleNodeLocked when the lock button is clicked', () => {
    // before
    renderTreeItem(false, node);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Lock layer' }));

    // result
    expect(selectNodes(store.getState())[node.id].locked).toBe(true);
  });

  it('should render the hidden node name with reduced opacity styling', () => {
    // before
    const { container } = renderTreeItem(false, { ...node, hidden: true });

    // result
    expect(container.querySelector('[class*="name--hidden"]')).toBeInTheDocument();
  });

  it('should remove the hide/lock buttons from the DOM while the name is being edited, so the input can take their space', () => {
    // before
    renderTreeItem(false, node);
    expect(screen.getByRole('button', { name: 'Hide layer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lock layer' })).toBeInTheDocument();

    // action
    fireEvent.doubleClick(screen.getByText('My Frame'));

    // result
    expect(screen.queryByRole('button', { name: 'Hide layer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lock layer' })).not.toBeInTheDocument();
  });

  it('should restore the hide/lock buttons once editing ends', () => {
    // before
    renderTreeItem(false, node);
    fireEvent.doubleClick(screen.getByText('My Frame'));

    // action
    fireEvent.blur(screen.getByRole('textbox'));

    // result
    expect(screen.getByRole('button', { name: 'Hide layer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lock layer' })).toBeInTheDocument();
  });
});
