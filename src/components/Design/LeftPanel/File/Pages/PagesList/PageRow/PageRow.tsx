import cx from 'classnames';
import { FC } from 'react';

// components
import PageRowMenu from './PageRowMenu';
import { EditableInput } from 'shared';

// hooks
import { usePageRowRename } from './hooks/usePageRowRename';
import { useRenamePage } from './hooks/useRenamePage';
import { useSelectPage } from './hooks/useSelectPage';

// store
import { selectActivePageId } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './page-row.module.scss';

// types
import { TDesignPage } from 'store/design/types';

export type TPageRowProps = {
  autoEdit: boolean;
  page: TDesignPage;
};

const PageRow: FC<TPageRowProps> = ({ autoEdit, page }) => {
  const activePageId = useAppSelector(selectActivePageId);
  const handleRename = useRenamePage(page.id);
  const handleSelect = useSelectPage(page.id);
  const { isRenameRequested, onEditingChange, onRename } = usePageRowRename();
  const isSelected = page.id === activePageId;

  return (
    <div className={cx(styles.PageRow, isSelected && styles['PageRow--active'])} onClick={handleSelect}>
      <EditableInput
        autoEdit={autoEdit || isRenameRequested}
        className={styles.PageRow__input}
        editOnDoubleClick
        onChange={handleRename}
        onEditingChange={onEditingChange}
        selected={isSelected}
        value={page.name}
      />
      <PageRowMenu id={page.id} onRename={onRename} />
    </div>
  );
};

export default PageRow;
