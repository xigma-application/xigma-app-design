import { FC, ReactNode, useRef } from 'react';

// components
import PageRow from './PageRow/PageRow';
import { Tree } from 'shared';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useReorderPages } from './hooks/useReorderPages';
import { useResizeHandler } from 'hooks';

// others
import { PAGES_LIST_RESIZE_SETTINGS, PAGES_LIST_ROW_HEIGHT } from './constants';

// store
import { selectPages } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './pages-list.module.scss';

// utils
import { getMaxPagesListHeight } from './utils/getMaxPagesListHeight';

export type TPagesListProps = {
  onPendingEditFinished: TFunc;
  pendingEditPageId: string | null;
};

const PagesList: FC<TPagesListProps> = ({ onPendingEditFinished, pendingEditPageId }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const pages = useAppSelector(selectPages);
  const orderedPages = Object.values(pages);
  const maxHeight = getMaxPagesListHeight();
  const { cursorY, height, onMouseDownY } = useResizeHandler({ ...PAGES_LIST_RESIZE_SETTINGS, maxHeight }, listRef);
  const handleResizeMouseDown = useHandleResizeMouseDown(onMouseDownY);
  const handleReorderPages = useReorderPages();

  const renderRow = (index: number): ReactNode => {
    const page = orderedPages[index];
    const autoEdit = page.id === pendingEditPageId;

    return <PageRow autoEdit={autoEdit} onAutoEditDismissed={autoEdit ? onPendingEditFinished : undefined} page={page} />;
  };

  return (
    <div className={styles.PagesList} ref={listRef} style={{ height }}>
      <Tree
        count={orderedPages.length}
        onReorder={handleReorderPages}
        renderRow={renderRow}
        rowHeight={PAGES_LIST_ROW_HEIGHT}
        scrollToIndex={orderedPages.findIndex((page) => page.id === pendingEditPageId)}
      />
      <div className={styles['PagesList__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorY }} />
    </div>
  );
};

export default PagesList;
