import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AddToSidebarMenu from './AddToSidebarMenu/AddToSidebarMenu';
import FileColorProfileMenu from './FileColorProfileMenu/FileColorProfileMenu';
import { Icon, Menu, MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  FILE_MENU_ADD_TO_SIDEBAR_KEY,
  FILE_MENU_ARIA_LABEL_KEY,
  FILE_MENU_CREATE_BRANCH_KEY,
  FILE_MENU_DUPLICATE_KEY,
  FILE_MENU_EXPORT_KEY,
  FILE_MENU_FILE_COLOR_PROFILE_KEY,
  FILE_MENU_MOVE_FILE_KEY,
  FILE_MENU_MOVE_TO_TRASH_KEY,
  FILE_MENU_PUBLISH_LIBRARY_KEY,
  FILE_MENU_RENAME_KEY,
  FILE_MENU_SHOW_VERSION_HISTORY_KEY,
} from './constants';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

export type TFileNameMenuProps = {
  onOpenChange: TFunc<[boolean]>;
  open: boolean;
};

const FileNameMenu: FC<TFileNameMenuProps> = ({ onOpenChange, open }) => {
  const { t } = useTranslation();

  return (
    <Menu
      onOpenChange={onOpenChange}
      open={open}
      trigger={<Icon name="ChevronDown" size={12} />}
      triggerAriaLabel={t(FILE_MENU_ARIA_LABEL_KEY)}
    >
      <MenuItem disabled label={t(FILE_MENU_SHOW_VERSION_HISTORY_KEY)} withCheck={false} />
      <MenuItem disabled label={t(FILE_MENU_PUBLISH_LIBRARY_KEY)} withCheck={false} />
      <MenuItem disabled label={t(FILE_MENU_EXPORT_KEY)} shortcut={KEYBOARD_SHORTCUTS.export.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuSub label={t(FILE_MENU_ADD_TO_SIDEBAR_KEY)}>
        <AddToSidebarMenu />
      </MenuSub>
      <MenuSeparator />
      <MenuItem disabled label={t(FILE_MENU_CREATE_BRANCH_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuSub label={t(FILE_MENU_FILE_COLOR_PROFILE_KEY)}>
        <FileColorProfileMenu />
      </MenuSub>
      <MenuSeparator />
      <MenuItem disabled label={t(FILE_MENU_DUPLICATE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(FILE_MENU_RENAME_KEY)} withCheck={false} />
      <MenuItem disabled label={t(FILE_MENU_MOVE_FILE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(FILE_MENU_MOVE_TO_TRASH_KEY)} withCheck={false} />
    </Menu>
  );
};

export default FileNameMenu;
