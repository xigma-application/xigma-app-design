import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { ADD_TO_SIDEBAR_MENU_STARRED_KEY } from './constants';

const { MenuItem } = MenuCompound;

const AddToSidebarMenu: FC = () => {
  const { t } = useTranslation();

  return <MenuItem disabled label={t(ADD_TO_SIDEBAR_MENU_STARRED_KEY)} withCheck={false} />;
};

export default AddToSidebarMenu;
