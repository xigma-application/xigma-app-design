import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon, Menu, MenuCompound } from 'shared';

// hooks
import { useCopyPageLink } from './hooks/useCopyPageLink';
import { useDeletePage } from './hooks/useDeletePage';
import { useDuplicatePage } from './hooks/useDuplicatePage';
import { usePreventMenuRefocus, useStopClickPropagation } from 'hooks';

// others
import {
  PAGE_MENU_ARIA_LABEL_KEY,
  PAGE_MENU_COPY_LINK_KEY,
  PAGE_MENU_DELETE_KEY,
  PAGE_MENU_DUPLICATE_KEY,
  PAGE_MENU_RENAME_KEY,
} from '../../constants';

// store
import { selectPages } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './page-row.module.scss';

const { MenuItem, MenuSeparator } = MenuCompound;

export type TPageRowMenuProps = {
  id: string;
  onRename: TFunc;
};

const PageRowMenu: FC<TPageRowMenuProps> = ({ id, onRename }) => {
  const { t } = useTranslation();
  const pages = useAppSelector(selectPages);
  const handleCopyLink = useCopyPageLink(id);
  const handleDuplicate = useDuplicatePage(id);
  const handleDelete = useDeletePage(id);
  const handleStopPropagation = useStopClickPropagation();
  const handlePreventRefocus = usePreventMenuRefocus();
  const isOnlyPage = Object.keys(pages).length <= 1;

  return (
    <div className={styles.PageRow__menu} onClick={handleStopPropagation}>
      <Menu
        onCloseAutoFocus={handlePreventRefocus}
        trigger={<Icon name="MoreOptions" size={24} />}
        triggerAriaLabel={t(PAGE_MENU_ARIA_LABEL_KEY)}
        triggerClassName={styles['PageRow__menu-trigger']}
      >
        <MenuItem label={t(PAGE_MENU_COPY_LINK_KEY)} onClick={handleCopyLink} />
        <MenuSeparator />
        <MenuItem label={t(PAGE_MENU_RENAME_KEY)} onClick={onRename} />
        <MenuItem label={t(PAGE_MENU_DUPLICATE_KEY)} onClick={handleDuplicate} />
        <MenuSeparator />
        <MenuItem disabled={isOnlyPage} label={t(PAGE_MENU_DELETE_KEY)} onClick={handleDelete} />
      </Menu>
    </div>
  );
};

export default PageRowMenu;
