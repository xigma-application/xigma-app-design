import cx from 'classnames';
import { FC, MouseEvent, ReactNode, RefObject, useRef } from 'react';

// components
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';

// hooks
import { useVirtualList } from 'hooks';

// styles
import styles from './tree.module.scss';

export type TTreeProps = {
  className?: string;
  count: number;
  height: number;
  onDeselectAll?: TFunc;
  renderRow: (index: number) => ReactNode;
  rowHeight: number;
  scrollToIndex?: number;
};

export const Tree: FC<TTreeProps> = ({ className = '', count, height, onDeselectAll, renderRow, rowHeight, scrollToIndex }) => {
  const rowsRef: RefObject<HTMLDivElement | null> = useRef(null);
  const { items, totalSize } = useVirtualList({ count, rowHeight, scrollRef: rowsRef, scrollToIndex });

  const handleRowsClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (onDeselectAll && event.target === event.currentTarget) {
      onDeselectAll();
    }
  };

  return (
    <div className={cx(styles.Tree, className)} style={{ height }}>
      <div className={styles.Tree__rows} onClick={handleRowsClick} ref={rowsRef}>
        <div className={styles.Tree__viewport} style={{ height: totalSize }}>
          {items.map((virtualRow) => (
            <div
              className={styles.Tree__row}
              key={virtualRow.key}
              style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
            >
              {renderRow(virtualRow.index)}
            </div>
          ))}
        </div>
      </div>
      <ScrollThumb className={styles.Tree__scrollThumb} scrollRef={rowsRef} />
    </div>
  );
};

export default Tree;
