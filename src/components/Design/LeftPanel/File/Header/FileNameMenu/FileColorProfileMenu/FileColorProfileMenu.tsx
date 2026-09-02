import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import {
  FILE_COLOR_PROFILE_MENU_ASSIGN_TO_DISPLAY_P3_KEY,
  FILE_COLOR_PROFILE_MENU_ASSIGN_TO_SRGB_KEY,
  FILE_COLOR_PROFILE_MENU_PREFERRED_PROFILE_KEY,
} from './constants';

const { MenuItem } = MenuCompound;

const FileColorProfileMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(FILE_COLOR_PROFILE_MENU_PREFERRED_PROFILE_KEY)} selected />
      <MenuItem disabled label={t(FILE_COLOR_PROFILE_MENU_ASSIGN_TO_SRGB_KEY)} />
      <MenuItem disabled label={t(FILE_COLOR_PROFILE_MENU_ASSIGN_TO_DISPLAY_P3_KEY)} />
    </>
  );
};

export default FileColorProfileMenu;
