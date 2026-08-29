import cx from 'classnames';
import { FC } from 'react';

// components
import PageRowMenu from './PageRowMenu';
import { EditableInput } from 'shared';

// hooks
import { usePageRowContextMenu } from './hooks/usePageRowContextMenu';
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
  onAutoEditDismissed?: TFunc;
  page: TDesignPage;
};

const PageRow: FC<TPageRowProps> = ({ autoEdit, onAutoEditDismissed, page }) => {
  const activePageId = useAppSelector(selectActivePageId);
  const handleRename = useRenamePage(page.id);
  const handleSelect = useSelectPage(page.id);
  const { isRenameRequested, onEditingChange, onRename } = usePageRowRename(autoEdit, onAutoEditDismissed);
  const { anchorRef, isOpen, onContextMenu, onOpenChange } = usePageRowContextMenu();
  const isSelected = page.id === activePageId;

  return (
    <div className={styles.PageRow} onClick={handleSelect} onContextMenu={onContextMenu}>
      <EditableInput
        autoEdit={autoEdit || isRenameRequested}
        className={cx(styles.PageRow__input, isOpen && !isSelected && styles['PageRow__input--menu-open'])}
        editOnDoubleClick
        onChange={handleRename}
        onEditingChange={onEditingChange}
        selected={isSelected}
        value={page.name}
      />
      <PageRowMenu anchorRef={anchorRef} id={page.id} isOpen={isOpen} onOpenChange={onOpenChange} onRename={onRename} />
    </div>
  );
};

export default PageRow;
