import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  FILE_MENU_CREATE_BRANCH_KEY,
  FILE_MENU_EXPORT_FRAMES_TO_PDF_KEY,
  FILE_MENU_EXPORT_KEY,
  FILE_MENU_NEW_DESIGN_KEY,
  FILE_MENU_NEW_KEY,
  FILE_MENU_PLACE_IMAGE_KEY,
  FILE_MENU_SAVE_LOCAL_COPY_KEY,
  FILE_MENU_SAVE_TO_VERSION_HISTORY_KEY,
  FILE_MENU_SHOW_VERSION_HISTORY_KEY,
} from './constants';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const FileMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(FILE_MENU_NEW_DESIGN_KEY)} withCheck={false} />
      <MenuSub label={t(FILE_MENU_NEW_KEY)} />
      <MenuSeparator />
      <MenuItem disabled label={t(FILE_MENU_PLACE_IMAGE_KEY)} shortcut={KEYBOARD_SHORTCUTS.placeImage.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(FILE_MENU_SAVE_LOCAL_COPY_KEY)} withCheck={false} />
      <MenuItem
        disabled
        label={t(FILE_MENU_SAVE_TO_VERSION_HISTORY_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.saveToVersionHistory.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(FILE_MENU_SHOW_VERSION_HISTORY_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(FILE_MENU_EXPORT_KEY)} shortcut={KEYBOARD_SHORTCUTS.export.join('')} withCheck={false} />
      <MenuItem disabled label={t(FILE_MENU_EXPORT_FRAMES_TO_PDF_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(FILE_MENU_CREATE_BRANCH_KEY)} withCheck={false} />
    </>
  );
};

export default FileMenu;
