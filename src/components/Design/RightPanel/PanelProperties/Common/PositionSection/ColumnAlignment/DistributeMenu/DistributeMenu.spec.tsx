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

// top-level 20x20 frames at the given positions, all selected
const selectedFramesAt = (positions: { x: number; y: number }[]): string[] => {
  const ids = positions.map(() => addFrame(20, 20));

  ids.forEach((id, index) => store.dispatch(updateNode({ changes: positions[index], id })));
  store.dispatch(setSelection(ids));

  return ids;
};

const xOf = (id: string): number => (selectActivePage(store.getState()).nodes[id] as TFrameNode).x;
const yOf = (id: string): number => (selectActivePage(store.getState()).nodes[id] as TFrameNode).y;

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

  it('should tidy up a multi-selected row with the most common gap, in a single undo step', () => {
    // mock: gaps of 10, 10 and 40
    const ids = selectedFramesAt([
      { x: 0, y: 0 },
      { x: 30, y: 2 },
      { x: 60, y: 0 },
      { x: 120, y: 1 },
    ]);

    // before
    renderDistributeMenu();

    // action
    openMenu();
    fireEvent.click(screen.getByText('Tidy up'));

    // result
    expect(ids.map(xOf)).toEqual([0, 30, 60, 90]);
    expect(ids.map(yOf)).toEqual([0, 2, 0, 1]);

    // action
    act(() => {
      store.dispatch(undo());
    });

    // result
    expect(xOf(ids[3])).toBe(120);
  });

  it('should distribute the vertical spacing of a multi-selection, keeping the outermost layers', () => {
    // mock
    const ids = selectedFramesAt([
      { x: 0, y: 0 },
      { x: 0, y: 30 },
      { x: 0, y: 200 },
    ]);

    // before
    renderDistributeMenu();

    // action
    openMenu();
    fireEvent.click(screen.getByText('Distribute vertical spacing'));

    // result
    expect(ids.map(yOf)).toEqual([0, 100, 200]);
  });

  it('should keep Tidy up disabled for piled-up layers and both distribute items disabled below three layers', () => {
    // mock
    selectedFramesAt([
      { x: 0, y: 0 },
      { x: 2, y: 2 },
    ]);

    // before
    renderDistributeMenu();

    // action
    openMenu();

    // result
    expect(isItemDisabled('Tidy up')).toBe(true);
    expect(isItemDisabled('Distribute horizontal spacing')).toBe(true);
  });

  const tidyUpTwice = (ids: string[]): { afterFirst: number[][]; afterSecond: number[][]; disabledAfterFirst: boolean } => {
    const positions = (): number[][] => ids.map((id) => [xOf(id), yOf(id)]);
    const { unmount } = renderDistributeMenu();

    openMenu();
    fireEvent.click(screen.getByText('Tidy up'));

    const afterFirst = positions();

    unmount();
    renderDistributeMenu();
    openMenu();

    const disabledAfterFirst = isItemDisabled('Tidy up');

    fireEvent.click(screen.getByText('Tidy up'));

    return { afterFirst, afterSecond: positions(), disabledAfterFirst };
  };

  it('should settle after one Tidy up on fractional sizes and then disable Tidy up', () => {
    // mock: 40.5px wide frames with gaps of 10, 10 and 50
    const ids = selectedFramesAt([
      { x: 0, y: 0 },
      { x: 50.5, y: 0 },
      { x: 101, y: 0 },
      { x: 191.5, y: 0 },
    ]);

    ids.forEach((id) => store.dispatch(updateNode({ changes: { width: 40.5 }, id })));

    // action
    const { afterFirst, afterSecond, disabledAfterFirst } = tidyUpTwice(ids);

    // result
    expect(disabledAfterFirst).toBe(true);
    expect(afterSecond).toEqual(afterFirst);
  });

  it('should reflow a 1000px wide frame and three frames below it into a two-column grid and then disable Tidy up', () => {
    // mock
    const ids = selectedFramesAt([
      { x: 0, y: 0 },
      { x: 0, y: 300 },
      { x: 140, y: 310 },
      { x: 400, y: 300 },
    ]);

    store.dispatch(updateNode({ changes: { height: 200, width: 1000 }, id: ids[0] }));
    ids.slice(1).forEach((id) => store.dispatch(updateNode({ changes: { height: 100, width: 100 }, id })));

    // action
    const { afterFirst, afterSecond, disabledAfterFirst } = tidyUpTwice(ids);

    // result
    expect(afterFirst).toEqual([
      [0, 0],
      [1040, 0],
      [0, 240],
      [1040, 240],
    ]);
    expect(disabledAfterFirst).toBe(true);
    expect(afterSecond).toEqual(afterFirst);
  });
});
