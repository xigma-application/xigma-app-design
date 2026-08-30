import { MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react';
import { VirtualItem } from '@tanstack/react-virtual';

// styles
import styles from '../tree.module.scss';

// types
import { TToggleExpand, TToggleExpandOptions, TTreeItem, TTreeRow } from '../types';

export type TTreeRowListProps<T extends TTreeItem> = {
  items: VirtualItem[];
  onRowMouseDown?: (index: number, event: ReactMouseEvent<HTMLElement>) => void;
  onToggleExpand: (row: TTreeRow<T>, options?: TToggleExpandOptions) => void;
  renderRow: (row: TTreeRow<T>, onToggleExpand: TToggleExpand) => ReactNode;
  rows: TTreeRow<T>[];
};

export const TreeRowList = <T extends TTreeItem>({
  items,
  onRowMouseDown,
  onToggleExpand,
  renderRow,
  rows,
}: TTreeRowListProps<T>): ReactElement => (
  <>
    {items.map((virtualRow) => (
      <div
        className={styles.Tree__row}
        key={virtualRow.key}
        onMouseDown={onRowMouseDown ? (event): void => onRowMouseDown(virtualRow.index, event) : undefined}
        style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
      >
        {renderRow(rows[virtualRow.index], (options): void => onToggleExpand(rows[virtualRow.index], options))}
      </div>
    ))}
  </>
);

export default TreeRowList;
