import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { THEME_MENU_DARK_KEY, THEME_MENU_LIGHT_KEY, THEME_MENU_SYSTEM_THEME_KEY } from './constants';

const { MenuItem } = MenuCompound;

const ThemeMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(THEME_MENU_LIGHT_KEY)} />
      <MenuItem disabled label={t(THEME_MENU_DARK_KEY)} selected />
      <MenuItem disabled label={t(THEME_MENU_SYSTEM_THEME_KEY)} />
    </>
  );
};

export default ThemeMenu;
