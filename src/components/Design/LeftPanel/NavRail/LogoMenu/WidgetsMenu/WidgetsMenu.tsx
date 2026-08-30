import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { WIDGETS_MENU_MANAGE_WIDGETS_KEY, WIDGETS_MENU_SELECT_ALL_WIDGETS_KEY } from './constants';

const { MenuItem } = MenuCompound;

const WidgetsMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(WIDGETS_MENU_MANAGE_WIDGETS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(WIDGETS_MENU_SELECT_ALL_WIDGETS_KEY)} withCheck={false} />
    </>
  );
};

export default WidgetsMenu;
