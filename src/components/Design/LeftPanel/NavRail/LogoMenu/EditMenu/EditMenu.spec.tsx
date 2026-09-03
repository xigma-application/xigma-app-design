import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import EditMenu from './EditMenu';

// core
import { CanvasRefsContext } from 'components/App/core/CanvasRefsProvider/context';

// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// store
import { addNode, deleteNode } from 'store/design/slice';
import { undo } from 'store/history/actions';
import { selectActivePage } from 'store/design/selectors';
import { historyStack, store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> => {
  const canvas = document.createElement('canvas');
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ height: 600, width: 1000 } as DOMRect);
  const refs = createCanvasRefs({ canvasRef: { current: canvas } });

  return render(
    <Provider store={store}>
      <CanvasRefsContext.Provider value={refs}>
        <DropdownMenuPrimitive.Root open>
          <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
      </CanvasRefsContext.Provider>
    </Provider>,
  );
};

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const drainHistory = (): void => {
  while (historyStack.canUndo()) {
    store.dispatch(undo());
  }

  selectActivePage(store.getState()).rootOrder.forEach((id) => store.dispatch(deleteNode(id)));

  while (historyStack.canUndo()) {
    store.dispatch(undo());
  }
};

describe('EditMenu', () => {
  it('should disable Undo and Redo while the history stack is empty', () => {
    // before — this runs before any undoable action, so past and future are both empty
    renderInMenu(<EditMenu />);

    // result
    expect(screen.getByText('Undo').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Redo').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should render every row with its label and shortcut', () => {
    // before
    renderInMenu(<EditMenu />);

    // result
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('⌘Z')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘Z')).toBeInTheDocument();
    expect(screen.getByText('Copy as')).toBeInTheDocument();
    expect(screen.getByText('Paste over selection')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘V')).toBeInTheDocument();
    expect(screen.getByText('Paste to replace')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘R')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('⌘D')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('⌫')).toBeInTheDocument();
    expect(screen.getByText('Find')).toBeInTheDocument();
    expect(screen.getByText('⌘F')).toBeInTheDocument();
    expect(screen.getByText('Find next')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘F')).toBeInTheDocument();
    expect(screen.getByText('Find previous')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘D')).toBeInTheDocument();
    expect(screen.getByText('Find and replace...')).toBeInTheDocument();
    expect(screen.getByText('Set default properties')).toBeInTheDocument();
    expect(screen.getByText('Copy properties')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘C')).toBeInTheDocument();
    expect(screen.getByText('Paste properties')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘V')).toBeInTheDocument();
    expect(screen.getByText('Pick color')).toBeInTheDocument();
    expect(screen.getByText('⌃C')).toBeInTheDocument();
    expect(screen.getByText('Select all')).toBeInTheDocument();
    expect(screen.getByText('⌘A')).toBeInTheDocument();
    expect(screen.getByText('Select matching layers')).toBeInTheDocument();
    expect(screen.getByText('⌥⌘A')).toBeInTheDocument();
    expect(screen.getByText('Select none')).toBeInTheDocument();
    expect(screen.getByText('↺')).toBeInTheDocument();
    expect(screen.getByText('Select inverse')).toBeInTheDocument();
    expect(screen.getByText('⇧⌘A')).toBeInTheDocument();
    expect(screen.getByText('Select all with')).toBeInTheDocument();
  });

  it('should disable every other flat item but leave the Copy as and Select all with submenus enabled', () => {
    // before
    renderInMenu(<EditMenu />);

    // result
    expect(screen.getByText('Select all').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    expect(screen.getByText('Copy as').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    expect(screen.getByText('Select all with').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
  });

  it('should enable Undo and step the last change back when it is selected', () => {
    // before
    drainHistory();
    const nodeId = addFrameNode();

    expect(historyStack.canUndo()).toBe(true);

    renderInMenu(<EditMenu />);

    // result
    expect(screen.getByText('Undo').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // action
    fireEvent.click(screen.getByText('Undo'));

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeUndefined();
  });

  it('should enable Redo once something has been undone and re-apply it when selected', () => {
    // before
    drainHistory();
    const nodeId = addFrameNode();
    store.dispatch(undo());

    expect(historyStack.canRedo()).toBe(true);
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeUndefined();

    renderInMenu(<EditMenu />);

    // result
    expect(screen.getByText('Redo').closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

    // action
    fireEvent.click(screen.getByText('Redo'));

    // result
    expect(selectActivePage(store.getState()).nodes[nodeId]).toBeDefined();
  });
});
