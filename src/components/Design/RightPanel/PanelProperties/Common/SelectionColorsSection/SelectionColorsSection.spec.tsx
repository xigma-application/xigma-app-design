import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import SelectionColorsSection from './SelectionColorsSection';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { undo } from 'store/history/actions';
import { store } from 'store';

// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode } from 'types/design/types';

const RED = { color: '#FF0000', opacity: 100, type: 'solid' as const };

const renderSection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <SelectionColorsSection />
      </TooltipProvider>
    </Provider>,
  );

const expandSection = (): void => {
  fireEvent.click(screen.getByText('Selection colors'));
};

const addFrameNode = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fills: [],
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

const addRectangleNode = (overrides: Partial<TRectangleNode> = {}): string => {
  store.dispatch(
    addNode({
      fills: [],
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addFourDistinctColors = (): string =>
  addFrameNode({
    childIds: [
      addRectangleNode({ fills: [{ color: '#00ff00', opacity: 100, type: 'solid' }] }),
      addRectangleNode({ fills: [{ color: '#0000ff', opacity: 100, type: 'solid' }] }),
      addRectangleNode({ fills: [{ color: '#ffff00', opacity: 100, type: 'solid' }] }),
    ],
    fills: [RED],
  });

const readFrame = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;
const readRectangle = (id: string): TRectangleNode => selectActivePage(store.getState()).nodes[id] as TRectangleNode;

const getRowCount = (container: HTMLElement): number =>
  container.querySelector('[class*="SelectionColorsSection__rows"]')?.children.length ?? 0;

describe('SelectionColorsSection behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render nothing when the selected frame has no children, even with its own colors', () => {
    // mock
    const frameId = addFrameNode({ fills: [RED] });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();

    // result
    expect(screen.queryByText('Selection colors')).toBeNull();
    expect(container).toBeEmptyDOMElement();
  });

  it('should always show the rows directly, with no chevron or preview, when there are 3 or fewer colors', () => {
    // mock
    const childId = addRectangleNode({ fills: [{ color: '#0000FF', opacity: 100, type: 'solid' }] });
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();

    // result
    expect(screen.getByText('Selection colors')).toBeTruthy();
    expect(container.querySelector('[aria-expanded]')).toBeNull();
    expect(container.querySelector('[class*="SelectionColorPreview"]')).toBeNull();
    expect(getRowCount(container)).toBe(2);
  });

  it('should start collapsed, showing the label and a color preview but no rows, once there are more than 3 colors', () => {
    // mock — 4 distinct colors makes the section collapsible
    const frameId = addFourDistinctColors();

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();

    // result
    expect(screen.getByText('Selection colors')).toBeTruthy();
    expect(container.querySelector('[aria-expanded]')).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('[class*="SelectionColorPreview__swatch"]')).toBeTruthy();
    expect(getRowCount(container)).toBe(0);
  });

  it('should cap the collapsed preview at 3 swatches and show how many more colors there are', () => {
    // mock
    const frameId = addFourDistinctColors();

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();

    // result — 4 distinct colors: 3 swatches shown, "+1" for the rest
    expect(container.querySelectorAll('[class*="SelectionColorPreview__swatch"]')).toHaveLength(3);
    expect(screen.getByText('+1')).toBeTruthy();
  });

  it('should not mark the chevron as expanded while collapsed, and mark it once expanded', () => {
    // mock
    const frameId = addFourDistinctColors();

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();
    const chevron = container.querySelector('[class*="SelectionColorsSectionHeader__chevron"]');

    // result — collapsed: points right, hidden until the header itself is hovered
    expect(chevron?.className).not.toMatch(/--expanded/);

    // action
    expandSection();

    // result — expanded: rotated to point down, but still only visible on hovering the header
    expect(container.querySelector('[class*="SelectionColorsSectionHeader__chevron"]')?.className).toMatch(/--expanded/);
  });

  it('should expand to show the row list when the header is clicked, and collapse again on a second click', () => {
    // mock
    const frameId = addFourDistinctColors();

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();

    // action
    expandSection();

    // result
    expect(container.querySelector('[aria-expanded]')).toHaveAttribute('aria-expanded', 'true');
    expect(getRowCount(container)).toBe(4);

    // action
    expandSection();

    // result
    expect(container.querySelector('[aria-expanded]')).toHaveAttribute('aria-expanded', 'false');
    expect(getRowCount(container)).toBe(0);
  });

  it('should mark the styles and shield buttons to only reveal on hovering their own row', () => {
    // mock
    const childId = addRectangleNode();
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));

    // before
    renderSection();
    expandSection();

    // result
    expect(screen.getByLabelText('Apply styles and variables').className).toMatch(/SelectionColorRow__actionIcon/);
    expect(screen.getByLabelText('Select 1 item using this color').className).toMatch(/SelectionColorRow__actionIcon/);
  });

  it('should select every node sharing a color when clicking its select button', () => {
    // mock
    const otherChildId = addRectangleNode({ fills: [{ color: '#0000FF', opacity: 100, type: 'solid' }] });
    const frameId = addFrameNode({ childIds: [otherChildId], fills: [RED] });

    store.dispatch(setSelection([frameId]));
    renderSection();

    // action — the RED group is the frame's own fill, listed first
    fireEvent.click(screen.getAllByLabelText('Select 1 item using this color')[0]);

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([frameId]);
  });

  it('should select only the main frame, not its matching child, since the parent takes priority', () => {
    // mock
    const childId = addRectangleNode({ fills: [RED] });
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    // the real app always keeps a child's parentId in sync with its parent's childIds; this fixture
    // needs it set explicitly too, since the parent-priority rule (unlike grouping) relies on parentId
    store.dispatch(updateNode({ changes: { parentId: frameId }, id: childId }));
    store.dispatch(setSelection([frameId]));
    renderSection();

    // action
    fireEvent.click(screen.getByLabelText('Select 1 item using this color'));

    // result
    expect(selectActivePage(store.getState()).selectedIds).toEqual([frameId]);
  });

  it('should pluralize the select tooltip/label with the number of nodes that will be selected', () => {
    // mock
    const otherChildId = addRectangleNode({ fills: [RED] });
    const frameId = addFrameNode({ childIds: [otherChildId], fills: [RED] });

    store.dispatch(setSelection([frameId]));

    // before
    renderSection();

    // result — the frame and its child both carry RED but aren't in a parent/child relationship
    // with each other for selection purposes here, so both count toward the same group
    expect(screen.getByLabelText('Select 2 items using this color')).toBeInTheDocument();
  });

  it('should merge the frame’s own fill with an identical child fill into a single row', () => {
    // mock
    const childId = addRectangleNode({ fills: [RED] });
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();
    expandSection();

    // result
    expect(getRowCount(container)).toBe(1);
  });

  it('should keep two different colors as two separate rows', () => {
    // mock
    const childId = addRectangleNode({ fills: [{ color: '#0000FF', opacity: 100, type: 'solid' }] });
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();
    expandSection();

    // result
    expect(getRowCount(container)).toBe(2);
  });

  it('should merge a fill and a stroke of the same color into one row', () => {
    // mock
    const childId = addRectangleNode();
    const frameId = addFrameNode({
      childIds: [childId],
      fills: [{ color: '#FFFFFF', opacity: 100, type: 'solid' }],
      strokes: [{ color: '#FFFFFF', opacity: 100, type: 'solid' }],
    });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();
    expandSection();

    // result
    expect(getRowCount(container)).toBe(1);
  });

  it('should keep the same color as two rows when one occurrence uses a different blend mode', () => {
    // mock
    const childId = addRectangleNode({ fills: [{ ...RED, blendMode: BlendMode.multiply }] });
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();
    expandSection();

    // result
    expect(getRowCount(container)).toBe(2);
  });

  it('should exclude a hidden child’s colors and a fill marked not visible', () => {
    // mock
    const hiddenChildId = addRectangleNode({ fills: [{ color: '#00FF00', opacity: 100, type: 'solid' }], hidden: true });
    const frameId = addFrameNode({
      childIds: [hiddenChildId],
      fills: [RED, { color: '#0000FF', opacity: 100, type: 'solid', visible: false }],
    });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();
    expandSection();

    // result
    expect(getRowCount(container)).toBe(1);
  });

  it('should render a gradient fill as its own row', () => {
    // mock
    const gradient = {
      end: { x: 1, y: 1 },
      opacity: 100,
      start: { x: 0, y: 0 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear' as const,
    };
    const childId = addRectangleNode();
    const frameId = addFrameNode({ childIds: [childId], fills: [gradient] });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();
    expandSection();

    // result
    expect(getRowCount(container)).toBe(1);
  });

  it('should ignore an image fill entirely', () => {
    // mock
    const childId = addRectangleNode();
    const frameId = addFrameNode({
      childIds: [childId],
      fills: [{ opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
    });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderSection();
    expandSection();

    // result
    expect(screen.getByText('Selection colors')).toBeTruthy();
    expect(getRowCount(container)).toBe(0);
  });

  it('should commit a hex edit to every node sharing that color as one undo step', () => {
    // mock
    const childId = addRectangleNode({ fills: [RED] });
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));
    renderSection();
    expandSection();

    // action
    fireEvent.blur(screen.getByDisplayValue('FF0000'), { target: { value: '00ff00' } });

    // result
    expect(readFrame(frameId).fills[0]).toMatchObject({ color: '#00ff00' });
    expect(readRectangle(childId).fills[0]).toMatchObject({ color: '#00ff00' });

    // action
    store.dispatch(undo());

    // result
    expect(readFrame(frameId).fills[0]).toEqual(RED);
    expect(readRectangle(childId).fills[0]).toEqual(RED);
  });

  it('should keep the picker open after editing a value inside it, not remount and close on every edit', () => {
    // mock
    const childId = addRectangleNode({ fills: [RED] });
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));
    renderSection();
    expandSection();

    // action — open the picker, then edit the color from inside the still-open row
    fireEvent.click(screen.getByLabelText('Hex color'));
    fireEvent.blur(screen.getByDisplayValue('FF0000'), { target: { value: '00ff00' } });

    // result — the row's own signature just changed, but the picker must not have remounted closed
    expect(screen.getByLabelText('Apply blend mode to fill')).toBeInTheDocument();
  });

  it('should update the store live from a color picked inside the open panel, while keeping its row from merging until it closes', () => {
    // mock — picking blue from the RED row's own panel would otherwise instantly match the child's blue fill
    const childId = addRectangleNode({ fills: [{ color: '#0000FF', opacity: 100, type: 'solid' }] });
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));
    const { container } = renderSection();
    expandSection();

    // action — open the RED row's panel, then pick blue from the panel's own hex field (not the row's inline one)
    fireEvent.click(screen.getAllByLabelText('Hex color')[0]);

    const panelHexInput = document.querySelector('[class*="HexField"]') as HTMLInputElement;

    fireEvent.blur(panelHexInput, { target: { value: '0000ff' } });

    // result — the store already reflects the live pick, so the canvas sees it right away...
    expect(readFrame(frameId).fills[0]).toMatchObject({ color: '#0000ff' });
    // ...but the list still shows two rows: merging them while the panel is open would change this row's own
    // occurrence membership and remount it, closing the panel out from under the user mid-interaction
    expect(getRowCount(container)).toBe(2);
    expect(screen.getByLabelText('Apply blend mode to fill')).toBeInTheDocument();
  });

  it('should open the settings picker when the swatch trigger is clicked', () => {
    // mock
    const childId = addRectangleNode();
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));
    renderSection();
    expandSection();

    // action
    fireEvent.click(screen.getByLabelText('Hex color'));

    // result
    expect(screen.getByLabelText('Apply blend mode to fill')).toBeInTheDocument();
  });

  it('should commit an opacity edit to a solo color as a single node change', () => {
    // mock
    const childId = addRectangleNode();
    const frameId = addFrameNode({ childIds: [childId], fills: [RED] });

    store.dispatch(setSelection([frameId]));
    renderSection();
    expandSection();

    // action
    fireEvent.blur(screen.getByDisplayValue('100'), { target: { value: '50' } });

    // result
    expect(readFrame(frameId).fills[0]).toEqual({ ...RED, opacity: 50 });
  });
});
