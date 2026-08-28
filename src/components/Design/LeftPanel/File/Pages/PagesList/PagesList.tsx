import { FC, useRef } from 'react';

// components
import PageRow from './PageRow/PageRow';
import ScrollThumb from 'shared/ScrollThumb/ScrollThumb';

// hooks
import { useHandleResizeMouseDown } from './hooks/useHandleResizeMouseDown';
import { useResizeHandler } from 'hooks';

// others
import { PAGES_LIST_RESIZE_SETTINGS } from './constants';

// store
import { selectPages } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './pages-list.module.scss';

// utils
import { getMaxPagesListHeight } from './utils/getMaxPagesListHeight';

export type TPagesListProps = {
  pendingEditPageId: string | null;
};

const PagesList: FC<TPagesListProps> = ({ pendingEditPageId }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const pages = useAppSelector(selectPages);
  const maxHeight = getMaxPagesListHeight();
  const { cursorY, height, onMouseDownY } = useResizeHandler({ ...PAGES_LIST_RESIZE_SETTINGS, maxHeight }, listRef);
  const handleResizeMouseDown = useHandleResizeMouseDown(onMouseDownY);

  return (
    <div className={styles.PagesList} ref={listRef} style={{ height }}>
      <div className={styles.PagesList__rows} ref={rowsRef}>
        {Object.values(pages).map((page) => (
          <PageRow autoEdit={page.id === pendingEditPageId} key={page.id} page={page} />
        ))}
      </div>
      <ScrollThumb className={styles.PagesList__scrollThumb} scrollRef={rowsRef} />
      <div className={styles['PagesList__resize-handle']} onMouseDown={handleResizeMouseDown} style={{ cursor: cursorY }} />
    </div>
  );
};

export default PagesList;
