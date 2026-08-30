import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import XigmaLogoShape from '@xigma/assets/xigma-logo-shape.svg?react';

// components
import FileMenu from './FileMenu/FileMenu';
import { Menu, MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  LOGO_MENU_ACTIONS_KEY,
  LOGO_MENU_AI_BALANCE_KEY,
  LOGO_MENU_ARRANGE_KEY,
  LOGO_MENU_BACK_TO_FILES_KEY,
  LOGO_MENU_EDIT_KEY,
  LOGO_MENU_FILE_KEY,
  LOGO_MENU_HELP_AND_ACCOUNT_KEY,
  LOGO_MENU_LIBRARIES_KEY,
  LOGO_MENU_OBJECT_KEY,
  LOGO_MENU_OPEN_DESKTOP_APP_KEY,
  LOGO_MENU_PLUGINS_KEY,
  LOGO_MENU_PREFERENCES_KEY,
  LOGO_MENU_TEXT_KEY,
  LOGO_MENU_VECTOR_KEY,
  LOGO_MENU_VIEW_KEY,
  LOGO_MENU_WIDGETS_KEY,
} from './constants';

// styles
import styles from '../nav-rail.module.scss';

const { MenuItem, MenuSeparator, MenuSub } = MenuCompound;

const LogoMenu: FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Menu
      onOpenChange={setIsOpen}
      open={isOpen}
      trigger={<XigmaLogoShape />}
      triggerAriaLabel="xigma"
      triggerClassName={styles.NavRail__logo}
    >
      <MenuItem disabled label={t(LOGO_MENU_BACK_TO_FILES_KEY)} marginBottom withCheck={false} />
      <MenuSeparator />
      <MenuItem
        disabled
        icon="Search"
        iconSize={24}
        label={t(LOGO_MENU_ACTIONS_KEY)}
        marginBottom
        marginTop
        shortcut={KEYBOARD_SHORTCUTS.openActions.join('')}
        withCheck={false}
      />
      <MenuSeparator />
      <MenuSub label={t(LOGO_MENU_FILE_KEY)} marginTop>
        <FileMenu />
      </MenuSub>
      <MenuSub label={t(LOGO_MENU_EDIT_KEY)} />
      <MenuSub label={t(LOGO_MENU_VIEW_KEY)} />
      <MenuSub label={t(LOGO_MENU_OBJECT_KEY)} />
      <MenuSub label={t(LOGO_MENU_TEXT_KEY)} />
      <MenuSub label={t(LOGO_MENU_ARRANGE_KEY)} />
      <MenuSub label={t(LOGO_MENU_VECTOR_KEY)} marginBottom />
      <MenuSeparator />
      <MenuItem disabled label={t(LOGO_MENU_PLUGINS_KEY)} marginTop withCheck={false} />
      <MenuItem disabled label={t(LOGO_MENU_WIDGETS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(LOGO_MENU_PREFERENCES_KEY)} withCheck={false} />
      <MenuItem disabled label={t(LOGO_MENU_LIBRARIES_KEY)} withCheck={false} marginBottom />
      <MenuSeparator />
      <MenuItem disabled label={t(LOGO_MENU_OPEN_DESKTOP_APP_KEY)} marginTop withCheck={false} />
      <MenuSub label={t(LOGO_MENU_AI_BALANCE_KEY)} />
      <MenuSub label={t(LOGO_MENU_HELP_AND_ACCOUNT_KEY)} />
    </Menu>
  );
};

export default LogoMenu;
