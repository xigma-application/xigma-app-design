import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import {
  MAIN_COMPONENT_MENU_GO_TO_MAIN_COMPONENT_KEY,
  MAIN_COMPONENT_MENU_PUSH_CHANGES_KEY,
  MAIN_COMPONENT_MENU_RESTORE_MAIN_COMPONENT_KEY,
} from './constants';

const { MenuItem } = MenuCompound;

const MainComponentMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(MAIN_COMPONENT_MENU_GO_TO_MAIN_COMPONENT_KEY)} shortcut="⌃⌥⌘K" withCheck={false} />
      <MenuItem disabled label={t(MAIN_COMPONENT_MENU_PUSH_CHANGES_KEY)} withCheck={false} />
      <MenuItem disabled label={t(MAIN_COMPONENT_MENU_RESTORE_MAIN_COMPONENT_KEY)} withCheck={false} />
    </>
  );
};

export default MainComponentMenu;
