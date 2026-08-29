import * as PopoverPrimitive from '@radix-ui/react-popover';
import { FC, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { PopoverCompound } from 'shared';

// hooks
import { TVirtualAnchor } from './hooks/usePageRowContextMenu';
import { useCopyPageLink } from './hooks/useCopyPageLink';
import { useDeletePage } from './hooks/useDeletePage';
import { useDuplicatePage } from './hooks/useDuplicatePage';
import { usePreventMenuRefocus } from 'hooks';

// others
import { PAGE_MENU_COPY_LINK_KEY, PAGE_MENU_DELETE_KEY, PAGE_MENU_DUPLICATE_KEY, PAGE_MENU_RENAME_KEY } from '../../constants';

// store
import { selectPages } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './page-row-menu.module.scss';

const { PopoverItem, PopoverSeparator } = PopoverCompound;

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
  const isOnlyPage = Object.keys(pages).length <= 1;

  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange} open={isOpen}>
      <PopoverPrimitive.Anchor virtualRef={anchorRef} />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          className={styles.PageRowMenu}
          onCloseAutoFocus={handlePreventRefocus}
          side="bottom"
          sideOffset={0}
        >
          <PopoverItem label={t(PAGE_MENU_COPY_LINK_KEY)} onClick={handleCopyLink} withCheck={false} />
          <PopoverSeparator />
          <PopoverItem label={t(PAGE_MENU_RENAME_KEY)} onClick={onRename} withCheck={false} />
          <PopoverItem label={t(PAGE_MENU_DUPLICATE_KEY)} onClick={handleDuplicate} withCheck={false} />
          <PopoverSeparator />
          <PopoverItem disabled={isOnlyPage} label={t(PAGE_MENU_DELETE_KEY)} onClick={handleDelete} withCheck={false} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

export default PageRowMenu;
