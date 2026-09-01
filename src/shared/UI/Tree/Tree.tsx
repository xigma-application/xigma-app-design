import cx from 'classnames';
import { ReactElement, ReactNode, RefObject, useMemo, useRef } from 'react';

// components
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';
import TreeDropOverlay from './TreeDropOverlay/TreeDropOverlay';
import TreeRowList from './TreeRowList/TreeRowList';
import TreeSelectionBackground from './TreeSelectionBackground/TreeSelectionBackground';

// hooks
import { useHandleRowsClick } from './hooks/useHandleRowsClick';
import { useSpringLoadExpand } from './hooks/useSpringLoadExpand';
import { useTreeExpansion } from './hooks/useTreeExpansion';
import { useTreeRowDrag } from './hooks/useTreeRowDrag/useTreeRowDrag';
import { useVirtualList } from 'hooks';

// styles
import styles from './tree.module.scss';

// types
import { TToggleExpand, TTreeItem, TTreeRow } from './types';

// utils
import { flattenTreeRows } from './utils/flattenTreeRows';
import { getTreeBackgroundSegments } from './utils/getTreeBackgroundSegments';

export type TTreeProps<T extends TTreeItem> = {
  className?: string;
  expandedIds?: Set<string>;
  getChildren: (item: T) => T[] | undefined;
  isRowHighlighted?: (item: T) => boolean;
  isRowSelected?: (item: T) => boolean;
  onDeselectAll?: TFunc;
  onExpandedIdsChange?: (next: Set<string>) => void;
  onReorder?: (draggedItems: T[], targetParentItem: T | null, targetIndex: number) => void;
  renderDropIndicator?: (depth: number) => ReactNode;
  renderRow: (row: TTreeRow<T>, onToggleExpand: TToggleExpand) => ReactNode;
  roots: T[];
  rowHeight: number;
  scrollToIndex?: number;
};

export const Tree = <T extends TTreeItem>({
  className = '',
  expandedIds: controlledExpandedIds,
  getChildren,
  isRowHighlighted,
  isRowSelected,
  onDeselectAll,
  onExpandedIdsChange,
  onReorder,
  renderDropIndicator,
  renderRow,
  roots,
  rowHeight,
  scrollToIndex,
}: TTreeProps<T>): ReactElement => {
  const rowsRef: RefObject<HTMLDivElement | null> = useRef(null);
  const { expandedIds, onToggleExpand } = useTreeExpansion(controlledExpandedIds, onExpandedIdsChange, getChildren);
  const rows = useMemo(() => flattenTreeRows(roots, getChildren, expandedIds), [roots, getChildren, expandedIds]);
  const { items, totalSize } = useVirtualList({ count: rows.length, rowHeight, scrollRef: rowsRef, scrollToIndex });
  const onSpringLoadExpand = useSpringLoadExpand(rows, onToggleExpand);
  const { dropDepth, dropInsideIndex, handleRowMouseDown, insertionIndex } = useTreeRowDrag({
    isRowSelected,
    onReorder,
    onSpringLoadExpand,
    rowHeight,
    rows,
    rowsRef,
  });
  const isDragging = insertionIndex !== null;
  const handleRowsClick = useHandleRowsClick(onDeselectAll);
  const { highlightBackgroundSegments, selectionBackgroundSegments } = getTreeBackgroundSegments(
    items,
    rows,
    isRowSelected,
    isRowHighlighted,
  );

  return (
    <div className={cx(styles.Tree, className)}>
      <div className={styles.Tree__rows} onClick={handleRowsClick} ref={rowsRef}>
        <div className={cx(styles.Tree__viewport, isDragging && styles['Tree__viewport--dragging'])} style={{ height: totalSize }}>
          <TreeSelectionBackground segments={highlightBackgroundSegments} variant="highlight" />
          <TreeSelectionBackground segments={selectionBackgroundSegments} />
          <TreeRowList
            items={items}
            onRowMouseDown={onReorder ? handleRowMouseDown : undefined}
            onToggleExpand={onToggleExpand}
            renderRow={renderRow}
            rows={rows}
          />
          <TreeDropOverlay
            dropDepth={dropDepth}
            dropInsideIndex={dropInsideIndex}
            insertionIndex={insertionIndex}
            isDefault={!renderDropIndicator}
            renderDropIndicator={renderDropIndicator}
            rowHeight={rowHeight}
          />
        </div>
      </div>
      <ScrollThumb className={styles.Tree__scrollThumb} scrollRef={rowsRef} />
      <ScrollThumb className={styles.Tree__scrollThumbHorizontal} orientation="horizontal" scrollRef={rowsRef} />
    </div>
  );
};

export default Tree;
