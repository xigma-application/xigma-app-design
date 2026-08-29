import cx from 'classnames';
import { FC, MouseEvent, ReactNode, RefObject, useRef } from 'react';

// components
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';

// hooks
import { useTreeRowDrag } from './hooks/useTreeRowDrag/useTreeRowDrag';
import { useVirtualList } from 'hooks';

// styles
import styles from './tree.module.scss';

export type TTreeProps = {
  className?: string;
  count: number;
  onDeselectAll?: TFunc;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  renderRow: (index: number) => ReactNode;
  rowHeight: number;
  scrollToIndex?: number;
};

export const Tree: FC<TTreeProps> = ({ className = '', count, onDeselectAll, onReorder, renderRow, rowHeight, scrollToIndex }) => {
  const rowsRef: RefObject<HTMLDivElement | null> = useRef(null);
  const { items, totalSize } = useVirtualList({ count, rowHeight, scrollRef: rowsRef, scrollToIndex });
  const { dragIndex, handleRowMouseDown, insertionIndex, pointerOffsetY } = useTreeRowDrag({ count, onReorder, rowHeight, rowsRef });

  const handleRowsClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (onDeselectAll && event.target === event.currentTarget) {
      onDeselectAll();
    }
  };

  return (
    <div className={cx(styles.Tree, className)}>
      <div className={styles.Tree__rows} onClick={handleRowsClick} ref={rowsRef}>
        <div className={styles.Tree__viewport} style={{ height: totalSize }}>
          {items.map((virtualRow) => {
            const isDragged = virtualRow.index === dragIndex;
            const translateY = isDragged ? virtualRow.start + pointerOffsetY : virtualRow.start;

            return (
              <div
                className={cx(styles.Tree__row, isDragged && styles['Tree__row--dragging'])}
                key={virtualRow.key}
                onMouseDown={onReorder ? (event): void => handleRowMouseDown(virtualRow.index, event) : undefined}
                style={{ height: virtualRow.size, transform: `translateY(${translateY}px)` }}
              >
                {renderRow(virtualRow.index)}
              </div>
            );
          })}
          {insertionIndex !== null && (
            <div className={styles.Tree__dropIndicator} style={{ transform: `translateY(${insertionIndex * rowHeight}px)` }} />
          )}
        </div>
      </div>
      <ScrollThumb className={styles.Tree__scrollThumb} scrollRef={rowsRef} />
    </div>
  );
};

export default Tree;
