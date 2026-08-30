import cx from 'classnames';
import { ReactElement, ReactNode, RefObject, useMemo, useRef } from 'react';

// components
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';
import TreeDropIndicator from './TreeDropIndicator/TreeDropIndicator';
import TreeRowList from './TreeRowList/TreeRowList';
import TreeSelectionBackground from './TreeSelectionBackground/TreeSelectionBackground';

// hooks
import { useExpandedIds } from './hooks/useExpandedIds';
import { useHandleRowsClick } from './hooks/useHandleRowsClick';
import { useTreeRowDrag } from './hooks/useTreeRowDrag/useTreeRowDrag';
import { useVirtualList } from 'hooks';

// styles
import styles from './tree.module.scss';

// types
import { TTreeItem, TTreeRow } from './types';

// utils
import { flattenTreeRows } from './utils/flattenTreeRows';
import { getIsRowSelectedByIndex } from './utils/getIsRowSelectedByIndex';
import { getSelectionBackgroundSegments } from './utils/getSelectionBackgroundSegments';

export type TTreeProps<T extends TTreeItem> = {
  className?: string;
  getChildren: (item: T) => T[] | undefined;
  isRowHighlighted?: (item: T) => boolean;
  isRowSelected?: (item: T) => boolean;
  onDeselectAll?: TFunc;
  onReorder?: (draggedItems: T[], targetParentItem: T | null, targetIndex: number) => void;
  renderDropIndicator?: (depth: number) => ReactNode;
  renderRow: (row: TTreeRow<T>, onToggleExpand: TFunc) => ReactNode;
  roots: T[];
  rowHeight: number;
  scrollToIndex?: number;
};

export const Tree = <T extends TTreeItem>({
  className = '',
  getChildren,
  isRowHighlighted,
  isRowSelected,
  onDeselectAll,
  onReorder,
  renderDropIndicator,
  renderRow,
  roots,
  rowHeight,
  scrollToIndex,
}: TTreeProps<T>): ReactElement => {
  const rowsRef: RefObject<HTMLDivElement | null> = useRef(null);
  const { expandedIds, toggleExpanded } = useExpandedIds();
  const rows = useMemo(() => flattenTreeRows(roots, getChildren, expandedIds), [roots, getChildren, expandedIds]);
  const { items, totalSize } = useVirtualList({ count: rows.length, rowHeight, scrollRef: rowsRef, scrollToIndex });
  const { dropDepth, handleRowMouseDown, insertionIndex } = useTreeRowDrag({ isRowSelected, onReorder, rowHeight, rows, rowsRef });
  const isDragging = insertionIndex !== null;
  const isRowSelectedByIndex = getIsRowSelectedByIndex(rows, isRowSelected);
  const isRowHighlightedByIndex = getIsRowSelectedByIndex(rows, isRowHighlighted);
  const isRowFilledByIndex = (index: number): boolean =>
    Boolean(isRowSelectedByIndex?.(index)) || Boolean(isRowHighlightedByIndex?.(index));
  const selectionBackgroundSegments = isRowSelectedByIndex
    ? getSelectionBackgroundSegments(items, isRowSelectedByIndex, isRowFilledByIndex)
    : [];
  const highlightBackgroundSegments = isRowHighlightedByIndex
    ? getSelectionBackgroundSegments(items, isRowHighlightedByIndex, isRowFilledByIndex)
    : [];
  const handleRowsClick = useHandleRowsClick(onDeselectAll);

  return (
    <div className={cx(styles.Tree, className)}>
      <div className={styles.Tree__rows} onClick={handleRowsClick} ref={rowsRef}>
        <div className={cx(styles.Tree__viewport, isDragging && styles['Tree__viewport--dragging'])} style={{ height: totalSize }}>
          <TreeSelectionBackground segments={highlightBackgroundSegments} variant="highlight" />
          <TreeSelectionBackground segments={selectionBackgroundSegments} />
          <TreeRowList
            items={items}
            onRowMouseDown={onReorder ? handleRowMouseDown : undefined}
            renderRow={renderRow}
            rows={rows}
            toggleExpanded={toggleExpanded}
          />
          {isDragging && (
            <TreeDropIndicator insertionIndex={insertionIndex} isDefault={!renderDropIndicator} rowHeight={rowHeight}>
              {renderDropIndicator?.(dropDepth)}
            </TreeDropIndicator>
          )}
        </div>
      </div>
      <ScrollThumb className={styles.Tree__scrollThumb} scrollRef={rowsRef} />
    </div>
  );
};

export default Tree;
