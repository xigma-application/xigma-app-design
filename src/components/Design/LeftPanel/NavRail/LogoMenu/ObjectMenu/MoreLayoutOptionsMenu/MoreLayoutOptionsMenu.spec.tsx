import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';

// components
import MoreLayoutOptionsMenu from './MoreLayoutOptionsMenu';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const renderInMenu = (children: ReactNode): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <DropdownMenuPrimitive.Root open>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content>{children}</DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </Provider>,
  );

const addFrameNode = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 200,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 200,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectangleNode = (): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 10,
      y: 10,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('MoreLayoutOptionsMenu', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render every still-unimplemented row disabled', () => {
    // before
    renderInMenu(<MoreLayoutOptionsMenu />);

    // result
    [
      'Suggest auto layout',
      'Remove all auto layout',
      'Lock aspect ratio',
      'Unlock aspect ratio',
      'Set width to hug contents',
      'Set height to hug contents',
      'Set width to fill container',
      'Set height to fill container',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });
  });

  it('should show the shortcuts', () => {
    // before
    renderInMenu(<MoreLayoutOptionsMenu />);

    // result
    expect(screen.getByText('⌃⇧A')).toBeInTheDocument();
    expect(screen.getByText('⌥⇧⌘R')).toBeInTheDocument();
  });

  it('should disable "Resize to fit" when there is no frame selected', () => {
    // before
    renderInMenu(<MoreLayoutOptionsMenu />);

    // result
    expect(screen.getByText('Resize to fit').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should disable "Resize to fit" when the selected frame has no children', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));

    // before
    renderInMenu(<MoreLayoutOptionsMenu />);

    // result
    expect(screen.getByText('Resize to fit').closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
  });

  it('should resize the selected frame around its children when "Resize to fit" is clicked', async () => {
    // mock
    const user = userEvent.setup();
    const childId = addRectangleNode();
    const frameId = addFrameNode({ childIds: [childId] });
    store.dispatch(setSelection([frameId]));

    // before
    renderInMenu(<MoreLayoutOptionsMenu />);
    const menuItem = screen.getByText('Resize to fit').closest('[role="menuitem"]') as HTMLElement;

    // result — enabled this time
    expect(menuItem).not.toHaveAttribute('data-disabled');

    // action
    await user.click(screen.getByText('Resize to fit'));

    // result
    const frame = selectActivePage(store.getState()).nodes[frameId] as TFrameNode;
    expect(frame.x).toBe(10);
    expect(frame.y).toBe(10);
    expect(frame.width).toBe(20);
    expect(frame.height).toBe(20);
  });
});
