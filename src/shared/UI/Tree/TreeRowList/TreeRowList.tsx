import { MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react';
import { VirtualItem } from '@tanstack/react-virtual';

// styles
import styles from '../tree.module.scss';

// types
import { TTreeItem, TTreeRow } from '../types';

export type TTreeRowListProps<T extends TTreeItem> = {
  items: VirtualItem[];
  onRowMouseDown?: (index: number, event: ReactMouseEvent<HTMLElement>) => void;
  renderRow: (row: TTreeRow<T>, onToggleExpand: TFunc) => ReactNode;
  rows: TTreeRow<T>[];
  toggleExpanded: TFunc<[string]>;
};

export const TreeRowList = <T extends TTreeItem>({
  items,
  onRowMouseDown,
  renderRow,
  rows,
  toggleExpanded,
}: TTreeRowListProps<T>): ReactElement => (
  <>
    {items.map((virtualRow) => (
      <div
        className={styles.Tree__row}
        key={virtualRow.key}
        onMouseDown={onRowMouseDown ? (event): void => onRowMouseDown(virtualRow.index, event) : undefined}
        style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
      >
        {renderRow(rows[virtualRow.index], (): void => toggleExpanded(rows[virtualRow.index].item.id))}
      </div>
    ))}
  </>
);

export default TreeRowList;
