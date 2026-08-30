import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { PLUGINS_MENU_MANAGE_PLUGINS_KEY, PLUGINS_MENU_RUN_LAST_PLUGIN_KEY } from './constants';

const { MenuItem } = MenuCompound;

const PluginsMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem
        disabled
        label={t(PLUGINS_MENU_RUN_LAST_PLUGIN_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.runLastPlugin.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(PLUGINS_MENU_MANAGE_PLUGINS_KEY)} withCheck={false} />
    </>
  );
};

export default PluginsMenu;
