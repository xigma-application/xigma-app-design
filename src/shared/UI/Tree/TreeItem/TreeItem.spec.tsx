import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import TreeItem, { TTreeItemProps } from './TreeItem';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// store
import { addNode, deleteNode, setSelection, setViewport } from 'store/design/slice';
import { selectNodes, selectSelectedIds, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

const canvas = document.createElement('canvas');

vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);

const canvasRefs = createCanvasRefs({ canvasRef: { current: canvas } });

const renderTreeItem = (isSelected: boolean, node: TSceneNode, extraProps: Partial<TTreeItemProps> = {}): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsContext.Provider value={canvasRefs}>
        <TreeItem isSelected={isSelected} node={node} renderIcon={(): null => null} {...extraProps} />
      </CanvasRefsContext.Provider>
    </Provider>,
  );

const buildGroupNode = (overrides: Partial<TGroupNode> = {}): TGroupNode => ({
  childIds: ['child-1'],
  height: 10,
  id: 'group-1',
  name: 'My Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildFrameNode = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: ['child-1'],
  clipContent: true,
  fill: '#ffffff',
  height: 10,
  id: 'frame-1',
  name: 'My Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('TreeItem', () => {
  let node: TRectangleNode;

  beforeEach(() => {
    store.dispatch(
      addNode({
        fill: '#ff0000',
        height: 10,
        name: 'My Frame',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 10,
        x: 0,
        y: 0,
      }),
    );
    node = Object.values(selectNodes(store.getState())).at(-1) as TRectangleNode;
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

  it('should call renderIcon with the row’s own node and render whatever it returns', () => {
    // mock
    const renderIcon = vi.fn(() => <span data-testid="row-icon">icon</span>);

    // before
    renderTreeItem(false, node, { renderIcon });

    // result
    expect(renderIcon).toHaveBeenCalledWith(node);
    expect(screen.getByTestId('row-icon')).toBeInTheDocument();
  });

  it('should select the node and zoom the viewport to it when the icon is double-clicked', () => {
    // mock
    store.dispatch(setViewport({ x: 0, y: 0, zoom: 1 }));
    let now = 0;
    const nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => (now += 1000));
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(now);

      return 0;
    });

    // before
    renderTreeItem(false, node, { renderIcon: () => <span data-testid="row-icon">icon</span> });

    // action
    fireEvent.doubleClick(screen.getByTestId('row-icon'));

    // result
    expect(selectSelectedIds(store.getState())).toEqual([node.id]);
    expect(selectViewport(store.getState())).not.toEqual({ x: 0, y: 0, zoom: 1 });

    nowSpy.mockRestore();
    rafSpy.mockRestore();
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

  it('should hide the hide/lock buttons entirely when hideActions is set', () => {
    // before
    renderTreeItem(false, node, { hideActions: true });

    // result
    expect(screen.queryByRole('button', { name: 'Hide layer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lock layer' })).not.toBeInTheDocument();
  });

  it('should not render an expand toggle for a non-group node', () => {
    // before
    renderTreeItem(false, node);

    // result
    expect(screen.queryByRole('button', { name: 'Expand layer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Collapse layer' })).not.toBeInTheDocument();
  });

  it('should not render an expand toggle for a group node with no children', () => {
    // before
    renderTreeItem(false, buildGroupNode({ childIds: [] }));

    // result
    expect(screen.queryByRole('button', { name: 'Expand layer' })).not.toBeInTheDocument();
  });

  it('should render a collapsed expand toggle, labeled "Expand layer", for a group node with children', () => {
    // before
    renderTreeItem(false, buildGroupNode());

    // result
    expect(screen.getByRole('button', { name: 'Expand layer' })).toBeInTheDocument();
  });

  it('should not render an expand toggle for a frame node with no children', () => {
    // before
    renderTreeItem(false, buildFrameNode({ childIds: [] }));

    // result
    expect(screen.queryByRole('button', { name: 'Expand layer' })).not.toBeInTheDocument();
  });

  it('should render a collapsed expand toggle, labeled "Expand layer", for a frame node with children', () => {
    // before
    renderTreeItem(false, buildFrameNode());

    // result
    expect(screen.getByRole('button', { name: 'Expand layer' })).toBeInTheDocument();
  });

  it('should label the expand toggle "Collapse layer" once isExpanded is true', () => {
    // before
    renderTreeItem(false, buildGroupNode(), { isExpanded: true });

    // result
    expect(screen.getByRole('button', { name: 'Collapse layer' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Expand layer' })).not.toBeInTheDocument();
  });

  it('should call onToggleExpand when the expand toggle is clicked, without also selecting the row', () => {
    // mock
    const onToggleExpand = vi.fn();

    // before
    renderTreeItem(false, buildGroupNode(), { onToggleExpand });

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Expand layer' }));

    // result
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should indent the row content further to the right as depth increases', () => {
    // before
    const { container: atRoot } = renderTreeItem(false, node);
    const { container: nested } = renderTreeItem(false, { ...node, id: 'nested' }, { depth: 2 });

    // result
    const rootContent = atRoot.querySelector('[class*="TreeItem__content"]') as HTMLElement;
    const nestedContent = nested.querySelector('[class*="TreeItem__content"]') as HTMLElement;

    expect(rootContent.style.marginLeft).toBe('0px');
    expect(nestedContent.style.marginLeft).toBe('42px');
  });

  it('should render row-decoration children inside the content row', () => {
    // before
    renderTreeItem(false, node, { children: <span data-testid="row-extra">extra</span> });

    // result
    expect(screen.getByTestId('row-extra')).toBeInTheDocument();
  });

  it('should hide the row-decoration children while the name is being edited', () => {
    // before
    renderTreeItem(false, node, { children: <span data-testid="row-extra">extra</span> });

    // action
    fireEvent.doubleClick(screen.getByText('My Frame'));

    // result
    expect(screen.queryByTestId('row-extra')).not.toBeInTheDocument();
  });
});
