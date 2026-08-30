import { fireEvent, render, screen } from '@testing-library/react';
import { VirtualItem } from '@tanstack/react-virtual';

// components
import TreeRowList from './TreeRowList';

// types
import { TTreeItem, TTreeRow } from '../types';

type TItem = TTreeItem;

const buildRow = (id: string): TTreeRow<TItem> => ({ depth: 0, hasChildren: false, isExpanded: false, item: { id }, parentItem: null });

const buildVirtualItem = (index: number): VirtualItem => ({
  end: index * 32 + 32,
  index,
  key: index,
  lane: 0,
  size: 32,
  start: index * 32,
});

describe('TreeRowList', () => {
  it('should render one row per virtual item, via renderRow', () => {
    // mock
    const rows = [buildRow('a'), buildRow('b')];

    // before
    render(
      <TreeRowList
        items={[buildVirtualItem(0), buildVirtualItem(1)]}
        renderRow={(row) => <span>Row {row.item.id}</span>}
        rows={rows}
        onToggleExpand={vi.fn()}
      />,
    );

    // result
    expect(screen.getByText('Row a')).toBeInTheDocument();
    expect(screen.getByText('Row b')).toBeInTheDocument();
  });

  it('should forward the row and the toggle options when the row calls its onToggleExpand callback', () => {
    // mock
    const onToggleExpand = vi.fn();
    const rows = [buildRow('a')];

    // before
    render(
      <TreeRowList
        items={[buildVirtualItem(0)]}
        onToggleExpand={onToggleExpand}
        renderRow={(row, rowOnToggleExpand) => <button onClick={() => rowOnToggleExpand({ recursive: true })}>Toggle {row.item.id}</button>}
        rows={rows}
      />,
    );

    // action
    fireEvent.click(screen.getByText('Toggle a'));

    // result
    expect(onToggleExpand).toHaveBeenCalledWith(rows[0], { recursive: true });
  });

  it('should wire onMouseDown to onRowMouseDown, with the virtual index, when provided', () => {
    // mock
    const onRowMouseDown = vi.fn();
    const rows = [buildRow('a')];

    // before
    const { container } = render(
      <TreeRowList
        items={[buildVirtualItem(0)]}
        onRowMouseDown={onRowMouseDown}
        renderRow={(row) => <span>Row {row.item.id}</span>}
        rows={rows}
        onToggleExpand={vi.fn()}
      />,
    );
    const rowElement = container.querySelector('[class*="Tree__row"]')!;

    // action
    fireEvent.mouseDown(rowElement, { button: 0 });

    // result
    expect(onRowMouseDown).toHaveBeenCalledTimes(1);
    expect(onRowMouseDown.mock.calls[0][0]).toBe(0);
  });

  it('should tolerate a mousedown on the row when onRowMouseDown is not provided', () => {
    // mock
    const rows = [buildRow('a')];

    // before
    const { container } = render(
      <TreeRowList
        items={[buildVirtualItem(0)]}
        renderRow={(row) => <span>Row {row.item.id}</span>}
        rows={rows}
        onToggleExpand={vi.fn()}
      />,
    );
    const rowElement = container.querySelector('[class*="Tree__row"]')!;

    // action & result — should not throw
    expect(() => fireEvent.mouseDown(rowElement, { button: 0 })).not.toThrow();
  });
});
