import cx from 'classnames';
import { FC, MouseEvent, ReactNode, RefObject, useRef } from 'react';

// components
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';

// hooks
import { useTreeRowDrag } from './hooks/useTreeRowDrag/useTreeRowDrag';
import { useVirtualList } from 'hooks';

// others
import { TREE_SELECTION_BACKGROUND_INSET_PX } from './constants';

// styles
import styles from './tree.module.scss';

// utils
import { getSelectionBackgroundSegments } from './utils/getSelectionBackgroundSegments';

export type TTreeProps = {
  className?: string;
  count: number;
  isRowSelected?: (index: number) => boolean;
  onDeselectAll?: TFunc;
  onReorder?: (fromIndices: number[], toIndex: number) => void;
  renderRow: (index: number) => ReactNode;
  rowHeight: number;
  scrollToIndex?: number;
};

export const Tree: FC<TTreeProps> = ({
  className = '',
  count,
  isRowSelected,
  onDeselectAll,
  onReorder,
  renderRow,
  rowHeight,
  scrollToIndex,
}) => {
  const rowsRef: RefObject<HTMLDivElement | null> = useRef(null);
  const { items, totalSize } = useVirtualList({ count, rowHeight, scrollRef: rowsRef, scrollToIndex });
  const { handleRowMouseDown, insertionIndex } = useTreeRowDrag({ count, isRowSelected, onReorder, rowHeight, rowsRef });
  const isDragging = insertionIndex !== null;
  const selectionBackgroundSegments = isRowSelected ? getSelectionBackgroundSegments(items, isRowSelected) : [];

  const handleRowsClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (onDeselectAll && event.target === event.currentTarget) {
      onDeselectAll();
    }
  };

  return (
    <div className={cx(styles.Tree, className)}>
      <div className={styles.Tree__rows} onClick={handleRowsClick} ref={rowsRef}>
        <div className={cx(styles.Tree__viewport, isDragging && styles['Tree__viewport--dragging'])} style={{ height: totalSize }}>
          {selectionBackgroundSegments.map((segment) => (
            <div
              className={cx(
                styles.Tree__selectionBackground,
                !segment.isRoundedTop && styles['Tree__selectionBackground--squareTop'],
                !segment.isRoundedBottom && styles['Tree__selectionBackground--squareBottom'],
              )}
              key={segment.start}
              style={{
                height:
                  segment.size -
                  (segment.isRoundedTop ? TREE_SELECTION_BACKGROUND_INSET_PX : 0) -
                  (segment.isRoundedBottom ? TREE_SELECTION_BACKGROUND_INSET_PX : 0),
                transform: `translateY(${segment.start + (segment.isRoundedTop ? TREE_SELECTION_BACKGROUND_INSET_PX : 0)}px)`,
              }}
            />
          ))}
          {items.map((virtualRow) => (
            <div
              className={styles.Tree__row}
              key={virtualRow.key}
              onMouseDown={onReorder ? (event): void => handleRowMouseDown(virtualRow.index, event) : undefined}
              style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
            >
              {renderRow(virtualRow.index)}
            </div>
          ))}
          {isDragging && (
            <div className={styles.Tree__dropIndicator} style={{ transform: `translateY(${insertionIndex * rowHeight}px)` }} />
          )}
        </div>
      </div>
      <ScrollThumb className={styles.Tree__scrollThumb} scrollRef={rowsRef} />
    </div>
  );
};

export default Tree;
