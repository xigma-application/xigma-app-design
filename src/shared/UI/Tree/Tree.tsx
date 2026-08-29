import { FC, useRef } from 'react';

// components
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';
import TreeItem from './TreeItem/TreeItem';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useResizeHandler, useVirtualList } from 'hooks';

// others
import { TREE_RESIZE_SETTINGS, TREE_ROW_HEIGHT } from './constants';

// store
import { selectOrderedNodes, selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './tree.module.scss';

// utils
import { getMaxTreeHeight } from './utils/getMaxTreeHeight';

export const Tree: FC = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const nodes = useAppSelector(selectOrderedNodes);
  const selectedIds = useAppSelector(selectSelectedIds);
  const maxHeight = getMaxTreeHeight();
  const { cursorY, height, onMouseDownY } = useResizeHandler({ ...TREE_RESIZE_SETTINGS, maxHeight }, listRef);
  const handleResizeMouseDown = useHandleResizeMouseDown(onMouseDownY);

  const { items, totalSize } = useVirtualList({
    count: nodes.length,
    rowHeight: TREE_ROW_HEIGHT,
    scrollRef: rowsRef,
  });

  return (
    <div className={styles.Tree} ref={listRef} style={{ height }}>
      <div className={styles.Tree__rows} ref={rowsRef}>
        <div className={styles.Tree__viewport} style={{ height: totalSize }}>
          {items.map((virtualRow) => {
            const node = nodes[virtualRow.index];

            return (
              <div
                className={styles.Tree__row}
                key={node.id}
                style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
              >
                <TreeItem isSelected={selectedIds.includes(node.id)} node={node} />
              </div>
            );
          })}
        </div>
      </div>
      <ScrollThumb className={styles.Tree__scrollThumb} scrollRef={rowsRef} />
      <div className={styles['Tree__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorY }} />
    </div>
  );
};

export default Tree;
