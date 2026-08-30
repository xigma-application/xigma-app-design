import { FC, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Menu, MenuCompound } from 'shared';

// hooks
import { TVirtualAnchor } from 'shared/UI/Tree/TreeItem/hooks/useTreeItemContextMenu';
import { useCopyPageLink } from './hooks/useCopyPageLink';
import { useDeletePage } from './hooks/useDeletePage';
import { useDuplicatePage } from './hooks/useDuplicatePage';
import { usePreventMenuRefocus, useStopClickPropagation } from 'hooks';

// others
import { PAGE_MENU_COPY_LINK_KEY, PAGE_MENU_DELETE_KEY, PAGE_MENU_DUPLICATE_KEY, PAGE_MENU_RENAME_KEY } from '../../constants';

// store
import { selectPages } from 'store/design/selectors';
import { useAppSelector } from 'store';

const { MenuItem, MenuSeparator } = MenuCompound;

export type TPageRowMenuProps = {
  anchorRef: RefObject<TVirtualAnchor>;
  id: string;
  isOpen: boolean;
  onOpenChange: TFunc<[boolean]>;
  onRename: TFunc;
};

const PageRowMenu: FC<TPageRowMenuProps> = ({ anchorRef, id, isOpen, onOpenChange, onRename }) => {
  const { t } = useTranslation();
  const pages = useAppSelector(selectPages);
  const handleCopyLink = useCopyPageLink(id);
  const handleDuplicate = useDuplicatePage(id);
  const handleDelete = useDeletePage(id);
  const handlePreventRefocus = usePreventMenuRefocus();
  const handleStopPropagation = useStopClickPropagation();
  const isOnlyPage = Object.keys(pages).length <= 1;

  return (
    <Menu
      anchorRef={anchorRef}
      onClick={handleStopPropagation}
      onCloseAutoFocus={handlePreventRefocus}
      onOpenChange={onOpenChange}
      open={isOpen}
      side="bottom"
      sideOffset={0}
    >
      <MenuItem label={t(PAGE_MENU_COPY_LINK_KEY)} onClick={handleCopyLink} withCheck={false} />
      <MenuSeparator />
      <MenuItem label={t(PAGE_MENU_RENAME_KEY)} onClick={onRename} withCheck={false} />
      <MenuItem label={t(PAGE_MENU_DUPLICATE_KEY)} onClick={handleDuplicate} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled={isOnlyPage} label={t(PAGE_MENU_DELETE_KEY)} onClick={handleDelete} withCheck={false} />
    </Menu>
  );
};

export default PageRowMenu;
