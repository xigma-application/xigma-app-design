import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { FILE_COLOR_PROFILE_MENU_PLACEHOLDER_KEY } from './constants';

const { MenuItem } = MenuCompound;

const FileColorProfileMenu: FC = () => {
  const { t } = useTranslation();

  return <MenuItem disabled label={t(FILE_COLOR_PROFILE_MENU_PLACEHOLDER_KEY)} withCheck={false} />;
};

export default FileColorProfileMenu;
