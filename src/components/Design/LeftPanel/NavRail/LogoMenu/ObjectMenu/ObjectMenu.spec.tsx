import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

const {
  onBringToFront,
  onFlatten,
  onFlipHorizontal,
  onFlipVertical,
  onGroupSelection,
  onOutlineStroke,
  onSendToBack,
  onUngroupSelection,
  onUseAsMask,
} = vi.hoisted(() => ({
  onBringToFront: vi.fn(),
  onFlatten: vi.fn(),
  onFlipHorizontal: vi.fn(),
  onFlipVertical: vi.fn(),
  onGroupSelection: vi.fn(),
  onOutlineStroke: vi.fn(),
  onSendToBack: vi.fn(),
  onUngroupSelection: vi.fn(),
  onUseAsMask: vi.fn(),
}));

vi.mock('components/Design/Menu/hooks/useNodeMenuActions', () => ({
  useNodeMenuActions: (): Partial<TNodeMenuActions> => ({
    onBringToFront,
    onFlatten,
    onFlipHorizontal,
    onFlipVertical,
    onGroupSelection,
    onOutlineStroke,
    onSendToBack,
    onUngroupSelection,
    onUseAsMask,
  }),
}));

// components
import ObjectMenu from './ObjectMenu';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import type { TNodeMenuActions } from 'components/Design/Menu/hooks/useNodeMenuActions';

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

const addFrameNode = (): string => {
  store.dispatch(
    addNode({ fill: '#ff0000', height: 20, name: 'Frame', parentId: null, rotation: 0, type: NodeType.frame, width: 20, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ObjectMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(setSelection([]));
  });

  it('should render every row with its label', () => {
    // before
    renderInMenu(<ObjectMenu />);

    // result
    [
      'Frame selection',
      'Group selection',
      'Ungroup selection',
      'Wrap in new section',
      'Convert to section',
      'Convert to frame',
      'Use as mask',
      'Set as thumbnail',
      'Add auto layout',
      'More layout options',
      'Create component',
      'Slots',
      'Reset instance',
      'Detach instance',
      'Main component',
      'Bring to front',
      'Bring forward',
      'Send backward',
      'Send to back',
      'Flip horizontal',
      'Flip vertical',
      'Rotate 180°',
      'Rotate 90° left',
      'Rotate 90° right',
      'Flatten',
      'Outline stroke',
      'Boolean groups',
      'Show/Hide selection',
      'Lock/Unlock selection',
      'Hide other layers',
      'Collapse layers',
      'Remove fill',
      'Remove stroke',
      'Swap fill and stroke',
      'Remove interactions',
      'Delete contents',
    ].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should show the Use as mask shortcut', () => {
    // before
    renderInMenu(<ObjectMenu />);

    // result
    expect(screen.getByText('⌃⌘M')).toBeInTheDocument();
  });

  it('should disable every row with no implementation yet, and every wireable row while nothing is selected, but leave the nested submenus enabled', () => {
    // before
    renderInMenu(<ObjectMenu />);

    // result — no implementation exists for these yet, so they stay disabled regardless of selection
    [
      'Frame selection',
      'Wrap in new section',
      'Convert to section',
      'Convert to frame',
      'Set as thumbnail',
      'Add auto layout',
      'Create component',
      'Reset instance',
      'Detach instance',
      'Bring forward',
      'Send backward',
      'Rotate 180°',
      'Rotate 90° left',
      'Rotate 90° right',
      'Show/Hide selection',
      'Lock/Unlock selection',
      'Hide other layers',
      'Collapse layers',
      'Remove fill',
      'Remove stroke',
      'Swap fill and stroke',
      'Remove interactions',
      'Delete contents',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });

    // result — these are wired to an existing action, but disabled while nothing is selected
    [
      'Group selection',
      'Ungroup selection',
      'Use as mask',
      'Bring to front',
      'Send to back',
      'Flip horizontal',
      'Flip vertical',
      'Flatten',
      'Outline stroke',
    ].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).toHaveAttribute('data-disabled');
    });

    // result — submenus stay reachable regardless
    ['More layout options', 'Slots', 'Main component', 'Boolean groups'].forEach((label) => {
      expect(screen.getByText(label).closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');
    });
  });

  it('should enable every wireable row once something is selected, and call its existing action when selected', () => {
    // before
    const nodeId = addFrameNode();
    store.dispatch(setSelection([nodeId]));

    renderInMenu(<ObjectMenu />);

    const cases: [string, ReturnType<typeof vi.fn>][] = [
      ['Group selection', onGroupSelection],
      ['Ungroup selection', onUngroupSelection],
      ['Use as mask', onUseAsMask],
      ['Bring to front', onBringToFront],
      ['Send to back', onSendToBack],
      ['Flip horizontal', onFlipHorizontal],
      ['Flip vertical', onFlipVertical],
      ['Flatten', onFlatten],
      ['Outline stroke', onOutlineStroke],
    ];

    cases.forEach(([label, handler]) => {
      // result
      expect(screen.getByText(label).closest('[role="menuitem"]')).not.toHaveAttribute('data-disabled');

      // action
      fireEvent.click(screen.getByText(label));

      // result
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
