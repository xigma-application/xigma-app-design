import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import {
  HELP_AND_ACCOUNT_MENU_ACCOUNT_SETTINGS_KEY,
  HELP_AND_ACCOUNT_MENU_HELP_PAGE_KEY,
  HELP_AND_ACCOUNT_MENU_KEYBOARD_SHORTCUTS_KEY,
  HELP_AND_ACCOUNT_MENU_LEGAL_SUMMARY_KEY,
  HELP_AND_ACCOUNT_MENU_LOG_OUT_KEY,
  HELP_AND_ACCOUNT_MENU_OPEN_FONT_SETTINGS_KEY,
  HELP_AND_ACCOUNT_MENU_RELEASE_NOTES_KEY,
  HELP_AND_ACCOUNT_MENU_SUPPORT_FORUM_KEY,
  HELP_AND_ACCOUNT_MENU_VIDEO_TUTORIALS_KEY,
} from './constants';

const { MenuItem, MenuSeparator } = MenuCompound;

const HelpAndAccountMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_HELP_PAGE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_KEYBOARD_SHORTCUTS_KEY)} shortcut="⌃⇧?" withCheck={false} />
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_SUPPORT_FORUM_KEY)} withCheck={false} />
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_VIDEO_TUTORIALS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_RELEASE_NOTES_KEY)} withCheck={false} />
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_OPEN_FONT_SETTINGS_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_LEGAL_SUMMARY_KEY)} withCheck={false} />
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_ACCOUNT_SETTINGS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(HELP_AND_ACCOUNT_MENU_LOG_OUT_KEY)} withCheck={false} />
    </>
  );
};

export default HelpAndAccountMenu;
