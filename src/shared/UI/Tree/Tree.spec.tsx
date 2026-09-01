import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

// components
import Tree from './Tree';

// types
import { TTreeItem, TTreeRow } from './types';

// utils
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

type TItem = TTreeItem & { children?: TItem[] };

const buildItem = (id: string, children?: TItem[]): TItem => ({ children, id });
const getChildren = (item: TItem): TItem[] | undefined => item.children;
const renderRow = (row: TTreeRow<TItem>): ReactNode => <span>Row {row.item.id}</span>;

describe('Tree', () => {
  beforeEach(() => {
    stubVirtualizerViewport();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render one row per root item via renderRow', () => {
    // before
    render(<Tree getChildren={getChildren} renderRow={renderRow} roots={[buildItem('0'), buildItem('1')]} rowHeight={32} />);

    // result
    expect(screen.getByText('Row 0')).toBeInTheDocument();
    expect(screen.getByText('Row 1')).toBeInTheDocument();
  });

  it('should call onDeselectAll when clicking the empty area, not a row', () => {
    // before
    const onDeselectAll = vi.fn();
    render(<Tree getChildren={getChildren} onDeselectAll={onDeselectAll} renderRow={renderRow} roots={[buildItem('0')]} rowHeight={32} />);

    // action — click the row's own content, which should not bubble into a deselect
    fireEvent.click(screen.getByText('Row 0'));

    // result
    expect(onDeselectAll).not.toHaveBeenCalled();
  });

  it('should call onDeselectAll when the empty scroll area itself is clicked', () => {
    // before
    const onDeselectAll = vi.fn();
    const { container } = render(
      <Tree getChildren={getChildren} onDeselectAll={onDeselectAll} renderRow={renderRow} roots={[buildItem('0')]} rowHeight={32} />,
    );
    const rowsContainer = container.querySelector('[class*="Tree__rows"]')!;

    // action
    fireEvent.click(rowsContainer);

    // result
    expect(onDeselectAll).toHaveBeenCalledTimes(1);
  });

  it('should show only a drop indicator while dragging, with the dragged row staying in place, then call onReorder with the resolved target on drop', () => {
    // mock
    const onReorder = vi.fn();
    const roots = [buildItem('0'), buildItem('1'), buildItem('2')];

    // before
    render(<Tree getChildren={getChildren} onReorder={onReorder} renderRow={renderRow} roots={roots} rowHeight={32} />);
    const rowZero = screen.getByText('Row 0').parentElement!;
    const initialTransform = (rowZero as HTMLElement).style.transform;

    // action
    fireEvent.mouseDown(rowZero, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 80 });

    // result
    expect(document.querySelector('[class*="dropIndicator"]')).toBeInTheDocument();
    expect((rowZero as HTMLElement).style.transform).toBe(initialTransform);
    expect(document.querySelector('[class*="viewport--dragging"]')).toBeInTheDocument();

    // action
    fireEvent.mouseUp(document);

    // result
    expect(onReorder).toHaveBeenCalledWith([roots[0]], null, 2);
    expect(document.querySelector('[class*="dropIndicator"]')).not.toBeInTheDocument();
    expect(document.querySelector('[class*="viewport--dragging"]')).not.toBeInTheDocument();
  });

  it('should not wire row dragging when onReorder is not provided', () => {
    // before
    render(<Tree getChildren={getChildren} renderRow={renderRow} roots={[buildItem('0'), buildItem('1')]} rowHeight={32} />);
    const rowZero = screen.getByText('Row 0').parentElement!;

    // action
    fireEvent.mouseDown(rowZero, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 80 });

    // result
    expect(document.querySelector('[class*="dropIndicator"]')).not.toBeInTheDocument();
  });

  it('should not render a selection background when isRowSelected is not provided', () => {
    // before
    const { container } = render(
      <Tree getChildren={getChildren} renderRow={renderRow} roots={[buildItem('0'), buildItem('1'), buildItem('2')]} rowHeight={32} />,
    );

    // result
    expect(container.querySelector('[class*="Tree__selectionBackground"]')).not.toBeInTheDocument();
  });

  it('should render a distinct highlight background for the rows flagged by isRowHighlighted', () => {
    // before
    const isRowHighlighted = (item: TItem): boolean => item.id === '1' || item.id === '2';
    const { container } = render(
      <Tree
        getChildren={getChildren}
        isRowHighlighted={isRowHighlighted}
        isRowSelected={(item: TItem): boolean => item.id === '0'}
        renderRow={renderRow}
        roots={[buildItem('0'), buildItem('1'), buildItem('2'), buildItem('3')]}
        rowHeight={32}
      />,
    );

    // result
    expect(container.querySelectorAll('[class*="Tree__selectionBackground--highlight"]')).toHaveLength(1);
    expect(container.querySelectorAll('[class*="Tree__selectionBackground"]:not([class*="highlight"])')).toHaveLength(1);
  });

  it('should square the touching edges so the selected and highlight backgrounds meet with no gap', () => {
    // before — group (selected) sits directly above its highlighted children
    const { container } = render(
      <Tree
        getChildren={getChildren}
        isRowHighlighted={(item: TItem): boolean => item.id === '1' || item.id === '2'}
        isRowSelected={(item: TItem): boolean => item.id === '0'}
        renderRow={renderRow}
        roots={[buildItem('0'), buildItem('1'), buildItem('2'), buildItem('3')]}
        rowHeight={32}
      />,
    );
    const selectionBackground = container.querySelector('[class*="Tree__selectionBackground"]:not([class*="highlight"])')!;
    const highlightBackground = container.querySelector('[class*="Tree__selectionBackground--highlight"]')!;

    // result
    expect(selectionBackground.className).toContain('squareBottom');
    expect(selectionBackground.className).not.toContain('squareTop');
    expect(highlightBackground.className).toContain('squareTop');
    expect(highlightBackground.className).not.toContain('squareBottom');
  });

  it('should not render a highlight background when isRowHighlighted is not provided', () => {
    // before
    const { container } = render(
      <Tree
        getChildren={getChildren}
        isRowSelected={(item: TItem): boolean => item.id === '0'}
        renderRow={renderRow}
        roots={[buildItem('0'), buildItem('1')]}
        rowHeight={32}
      />,
    );

    // result
    expect(container.querySelector('[class*="Tree__selectionBackground--highlight"]')).not.toBeInTheDocument();
  });

  it('should render one merged selection background for two adjacent selected rows, distinct from an isolated selected row', () => {
    // before
    const isRowSelected = (item: TItem): boolean => item.id === '0' || item.id === '1';
    const { container } = render(
      <Tree
        getChildren={getChildren}
        isRowSelected={isRowSelected}
        renderRow={renderRow}
        roots={[buildItem('0'), buildItem('1'), buildItem('2'), buildItem('3')]}
        rowHeight={32}
      />,
    );

    // result
    expect(container.querySelectorAll('[class*="Tree__selectionBackground"]')).toHaveLength(1);
    expect(container.querySelector('[class*="squareTop"]')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="squareBottom"]')).not.toBeInTheDocument();
  });

  it('should square off both edges of the selection background when the selection continues beyond the visible rows', () => {
    // mock — every item is selected, and the window is scrolled to the middle of a long list, so the rendered
    // window's own top/bottom edges each still have a real, selected neighbor just outside the window
    const isRowSelected = (): boolean => true;
    const roots = Array.from({ length: 100 }, (_, index) => buildItem(String(index)));

    // before
    const { container } = render(
      <Tree getChildren={getChildren} isRowSelected={isRowSelected} renderRow={renderRow} roots={roots} rowHeight={32} />,
    );
    const scrollContainer = container.querySelector('[class*="Tree__rows"]')!;
    Object.defineProperty(scrollContainer, 'scrollTop', { configurable: true, value: 1600 });
    fireEvent.scroll(scrollContainer);

    // result
    expect(container.querySelector('[class*="squareTop"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="squareBottom"]')).toBeInTheDocument();
  });

  it('should drag every selected row together when starting the drag on a row that is part of the current multi-selection', () => {
    // mock
    const onReorder = vi.fn();
    const isRowSelected = (item: TItem): boolean => item.id === '0' || item.id === '1';
    const roots = [buildItem('0'), buildItem('1'), buildItem('2'), buildItem('3')];

    // before
    render(
      <Tree
        getChildren={getChildren}
        isRowSelected={isRowSelected}
        onReorder={onReorder}
        renderRow={renderRow}
        roots={roots}
        rowHeight={32}
      />,
    );
    const rowZero = screen.getByText('Row 0').parentElement!;

    // action — drag row 0 (part of the [0,1] selection) down past row 3
    fireEvent.mouseDown(rowZero, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 128 });
    fireEvent.mouseUp(document);

    // result — both selected rows move together
    expect(onReorder).toHaveBeenCalledWith([roots[0], roots[1]], null, 2);
  });

  it('should render the default plain-line drop indicator when renderDropIndicator is not provided', () => {
    // before
    render(
      <Tree getChildren={getChildren} onReorder={vi.fn()} renderRow={renderRow} roots={[buildItem('0'), buildItem('1')]} rowHeight={32} />,
    );

    // action
    fireEvent.mouseDown(screen.getByText('Row 0').parentElement!, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 80 });

    // result
    expect(document.querySelector('[class*="dropIndicator--default"]')).toBeInTheDocument();
  });

  it('should render custom drop-indicator content, in place of the default line, when renderDropIndicator is provided', () => {
    // before
    render(
      <Tree
        getChildren={getChildren}
        onReorder={vi.fn()}
        renderDropIndicator={(depth) => <span>Custom indicator at depth {depth}</span>}
        renderRow={renderRow}
        roots={[buildItem('0'), buildItem('1')]}
        rowHeight={32}
      />,
    );

    // action
    fireEvent.mouseDown(screen.getByText('Row 0').parentElement!, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 80 });

    // result
    expect(screen.getByText('Custom indicator at depth 0')).toBeInTheDocument();
    expect(document.querySelector('[class*="dropIndicator--default"]')).not.toBeInTheDocument();
  });

  it('should pass the computed drop depth and resolved target parent through to renderDropIndicator and onReorder', () => {
    // mock
    const onReorder = vi.fn();
    const roots = [buildItem('0', [buildItem('0-0')]), buildItem('1')];

    // before
    render(
      <Tree
        getChildren={getChildren}
        onReorder={onReorder}
        renderDropIndicator={(depth) => <span>Drop depth {depth}</span>}
        renderRow={(row, onToggleExpand): ReactNode => <span onClick={(): void => onToggleExpand()}>Row {row.item.id}</span>}
        roots={roots}
        rowHeight={32}
      />,
    );

    // action — expand the first group so its child becomes visible: rows are now [0, 0-0, 1]
    fireEvent.click(screen.getByText('Row 0'));
    const row1 = screen.getByText('Row 1').parentElement!;

    // action — drag row '1' up onto the gap between '0' and '0-0', shifted right one indent level
    fireEvent.mouseDown(row1, { button: 0, clientX: 0, clientY: 100 });
    fireEvent.mouseMove(document, { clientX: 16, clientY: 32 });

    // result
    expect(screen.getByText('Drop depth 1')).toBeInTheDocument();

    // action
    fireEvent.mouseUp(document);

    // result — '1' becomes the first child of '0'
    expect(onReorder).toHaveBeenCalledWith([roots[1]], roots[0], 0);
  });

  it('should show a full-row outline instead of the line while a drag hovers the middle of a collapsed container, then nest on drop', () => {
    // mock
    const onReorder = vi.fn();
    const roots = [buildItem('0'), buildItem('g', [buildItem('g-0')])];

    // before
    render(<Tree getChildren={getChildren} onReorder={onReorder} renderRow={renderRow} roots={roots} rowHeight={32} />);
    const rowZero = screen.getByText('Row 0').parentElement!;

    // action — drag row 0 onto the middle of the collapsed group row (index 1, y 32..64)
    fireEvent.mouseDown(rowZero, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 48 });

    // result
    expect(document.querySelector('[class*="dropInsideOutline"]')).toBeInTheDocument();
    expect(document.querySelector('[class*="dropIndicator"]')).not.toBeInTheDocument();

    // action
    fireEvent.mouseUp(document);

    // result
    expect(onReorder).toHaveBeenCalledWith([roots[0]], roots[1], 0);
  });

  it('should auto-expand a collapsed container after a drag hovers it for the spring-load delay', () => {
    // mock
    vi.useFakeTimers();
    const roots = [buildItem('0'), buildItem('g', [buildItem('g-0')])];

    // before
    render(<Tree getChildren={getChildren} onReorder={vi.fn()} renderRow={renderRow} roots={roots} rowHeight={32} />);
    expect(screen.queryByText('Row g-0')).not.toBeInTheDocument();

    // action — start dragging row 0 and hold over the middle of the collapsed group
    fireEvent.mouseDown(screen.getByText('Row 0').parentElement!, { button: 0, clientY: 0 });
    fireEvent.mouseMove(document, { clientY: 48 });
    act(() => vi.advanceTimersByTime(3000));

    // result — the group expanded on its own
    expect(screen.getByText('Row g-0')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should size the viewport (and so the selection/hover backgrounds it anchors) to the true scrollable content width, not just the visible one', () => {
    // before — the viewport starts at whatever the (unmeasured, jsdom-default) scroll width is
    const { container, rerender } = render(
      <Tree getChildren={getChildren} renderRow={renderRow} roots={[buildItem('0'), buildItem('1')]} rowHeight={32} />,
    );
    const rowsContainer = container.querySelector('[class*="Tree__rows"]') as HTMLElement;
    const viewport = container.querySelector('[class*="Tree__viewport"]') as HTMLElement;

    // action — a deeply-nested row makes the true content wider than the panel; re-render (new
    // `rows` reference) is what re-triggers the measurement, exactly like an expand/rename would
    Object.defineProperty(rowsContainer, 'scrollWidth', { configurable: true, value: 640 });
    rerender(<Tree getChildren={getChildren} renderRow={renderRow} roots={[buildItem('0'), buildItem('1'), buildItem('2')]} rowHeight={32} />);

    // result
    expect(viewport.style.width).toBe('640px');
  });

  it('should expand or collapse a whole subtree at once when onToggleExpand is called with recursive, keyed off the clicked row', () => {
    // mock — a 3-level-deep chain: 0 > 0-0 > 0-0-0
    const roots = [buildItem('0', [buildItem('0-0', [buildItem('0-0-0')])])];
    const recursiveRenderRow = (row: TTreeRow<TItem>, onToggleExpand: (options?: { recursive?: boolean }) => void): ReactNode => (
      <span onClick={(): void => onToggleExpand({ recursive: true })}>Row {row.item.id}</span>
    );

    // before
    render(<Tree getChildren={getChildren} renderRow={recursiveRenderRow} roots={roots} rowHeight={32} />);
    expect(screen.queryByText('Row 0-0')).not.toBeInTheDocument();

    // action — recursive-toggle the collapsed root: every descendant becomes visible
    fireEvent.click(screen.getByText('Row 0'));

    // result
    expect(screen.getByText('Row 0-0')).toBeInTheDocument();
    expect(screen.getByText('Row 0-0-0')).toBeInTheDocument();

    // action — recursive-toggle it again: the whole subtree collapses back
    fireEvent.click(screen.getByText('Row 0'));

    // result
    expect(screen.queryByText('Row 0-0')).not.toBeInTheDocument();
  });

  it('should show a horizontal scroll thumb once the rows overflow the viewport width', () => {
    // before
    const { container } = render(
      <Tree getChildren={getChildren} renderRow={renderRow} roots={[buildItem('0'), buildItem('1')]} rowHeight={32} />,
    );
    const rowsContainer = container.querySelector('[class*="Tree__rows"]') as HTMLElement;

    // nothing overflows yet — no horizontal thumb
    expect(container.querySelector('[class*="scrollThumbHorizontal"], [class*="ScrollThumb--horizontal"]')).not.toBeInTheDocument();

    // action — the flattened rows are now wider than the viewport
    Object.defineProperty(rowsContainer, 'clientWidth', { configurable: true, value: 100 });
    Object.defineProperty(rowsContainer, 'scrollWidth', { configurable: true, value: 400 });
    fireEvent.scroll(rowsContainer);

    // result
    expect(container.querySelector('[class*="ScrollThumb--horizontal"]')).toBeInTheDocument();
  });

  it('should run in controlled mode when expandedIds and onExpandedIdsChange are both provided', () => {
    // mock
    const onExpandedIdsChange = vi.fn();
    const roots = [buildItem('0', [buildItem('0-0')])];
    const toggleRenderRow = (row: TTreeRow<TItem>, onToggleExpand: () => void): ReactNode => (
      <span onClick={(): void => onToggleExpand()}>Row {row.item.id}</span>
    );

    // before — the controlled set says '0' is expanded, so its child renders
    const { rerender } = render(
      <Tree
        expandedIds={new Set(['0'])}
        getChildren={getChildren}
        onExpandedIdsChange={onExpandedIdsChange}
        renderRow={toggleRenderRow}
        roots={roots}
        rowHeight={32}
      />,
    );
    expect(screen.getByText('Row 0-0')).toBeInTheDocument();

    // action — toggling routes the next set through the callback, not internal state
    fireEvent.click(screen.getByText('Row 0'));

    // result
    expect(onExpandedIdsChange).toHaveBeenCalledWith(new Set());

    // the tree only collapses once the controlled prop actually changes
    rerender(
      <Tree
        expandedIds={new Set()}
        getChildren={getChildren}
        onExpandedIdsChange={onExpandedIdsChange}
        renderRow={toggleRenderRow}
        roots={roots}
        rowHeight={32}
      />,
    );
    expect(screen.queryByText('Row 0-0')).not.toBeInTheDocument();
  });
});
