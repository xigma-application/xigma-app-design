import { FC } from 'react';

// components
import { EditableInput } from 'shared';

// hooks
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
  const isSelected = page.id === activePageId;

  return (
    <div className={styles.PageRow} onClick={handleSelect}>
      <EditableInput
        autoEdit={autoEdit}
        className={styles.PageRow__input}
        editOnDoubleClick
        onChange={handleRename}
        selected={isSelected}
        value={page.name}
      />
    </div>
  );
};

export default PageRow;
