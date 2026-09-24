import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import DistributeMenu from './DistributeMenu';
import { TooltipProvider } from 'shared';

// store
import { addNode, moveNodes, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';
import { undo } from 'store/history/actions';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { getLastAddedNodeId } from 'test/getLastAddedNodeId';

const renderDistributeMenu = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <DistributeMenu />
      </TooltipProvider>
    </Provider>,
  );

const addFrame = (width: number, height: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [],
      height,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width,
      x: 0,
      y: 0,
    }),
  );

  return getLastAddedNodeId(store.getState());
};

// a 400x300 top-level frame with children laid out left to right at the given x positions, 20 wide each
const frameWithChildrenAt = (xs: number[]): { childIds: string[]; frameId: string } => {
  const frameId = addFrame(400, 300);
  const childIds = xs.map(() => addFrame(20, 20));

  store.dispatch(moveNodes({ nodeIds: childIds, targetIndex: 0, targetParentId: frameId }));
  childIds.forEach((id, index) => store.dispatch(updateNode({ changes: { x: xs[index], y: 10 }, id })));
  store.dispatch(setSelection([frameId]));

  return { childIds, frameId };
};

const xOf = (id: string): number => (selectActivePage(store.getState()).nodes[id] as TFrameNode).x;

const isItemDisabled = (label: string): boolean => screen.getByText(label).closest('[class*="PopoverItem--disabled"]') !== null;

const openMenu = (): void => {
  fireEvent.click(screen.getByLabelText('More actions'));
};

afterEach(() => {
  store.dispatch(setSelection([]));
});

describe('DistributeMenu snapshots', () => {
  it('should render the closed distribute trigger', () => {
    // before
    const { asFragment } = renderDistributeMenu();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('DistributeMenu behaviors', () => {
  it('should list tidy up and both distribute spacing items with their shortcuts when opened', () => {
    // before
    renderDistributeMenu();

    // action
    openMenu();

    // result
    expect(screen.getByText('Tidy up')).toBeInTheDocument();
    expect(screen.getByText('Distribute vertical spacing')).toBeInTheDocument();
    expect(screen.getByText('Distribute horizontal spacing')).toBeInTheDocument();
  });

  it('should enable both distribute items, but not Tidy up, for a top-level frame with three children', () => {
    // mock
    frameWithChildrenAt([0, 50, 300]);

    // before
    renderDistributeMenu();

    // action
    openMenu();

    // result
    expect(isItemDisabled('Tidy up')).toBe(true);
    expect(isItemDisabled('Distribute vertical spacing')).toBe(false);
    expect(isItemDisabled('Distribute horizontal spacing')).toBe(false);
  });

  it('should disable both distribute items for a frame with only two children', () => {
    // mock
    frameWithChildrenAt([0, 300]);

    // before
    renderDistributeMenu();

    // action
    openMenu();

    // result
    expect(isItemDisabled('Distribute vertical spacing')).toBe(true);
    expect(isItemDisabled('Distribute horizontal spacing')).toBe(true);
  });

  it('should even out the horizontal gaps between children, keeping the outermost ones in place, in a single undo step', () => {
    // mock
    const { childIds } = frameWithChildrenAt([0, 50, 300]);

    // before
    renderDistributeMenu();

    // action
    openMenu();
    fireEvent.click(screen.getByText('Distribute horizontal spacing'));

    // result
    expect(childIds.map(xOf)).toEqual([0, 150, 300]);

    // action
    act(() => {
      store.dispatch(undo());
    });

    // result
    expect(childIds.map(xOf)).toEqual([0, 50, 300]);
  });
});
