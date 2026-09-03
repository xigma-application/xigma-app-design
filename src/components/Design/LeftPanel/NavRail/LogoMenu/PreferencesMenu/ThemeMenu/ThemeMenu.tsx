import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// hooks
import { useSelectTheme } from './hooks/useSelectTheme';

// others
import { THEME_MENU_DARK_KEY, THEME_MENU_LIGHT_KEY, THEME_MENU_SYSTEM_THEME_KEY } from './constants';

const { MenuItem } = MenuCompound;

const ThemeMenu: FC = () => {
  const { t } = useTranslation();
  const { selectTheme, selectedTheme } = useSelectTheme();

  return (
    <>
      <MenuItem label={t(THEME_MENU_LIGHT_KEY)} onClick={selectTheme('light')} selected={selectedTheme === 'light'} />
      <MenuItem label={t(THEME_MENU_DARK_KEY)} onClick={selectTheme('dark')} selected={selectedTheme === 'dark'} />
      <MenuItem label={t(THEME_MENU_SYSTEM_THEME_KEY)} onClick={selectTheme('system')} selected={selectedTheme === 'system'} />
    </>
  );
};

export default ThemeMenu;
