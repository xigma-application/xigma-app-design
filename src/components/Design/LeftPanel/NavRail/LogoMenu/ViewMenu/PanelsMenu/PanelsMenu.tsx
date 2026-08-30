import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  PANELS_MENU_LIBRARIES_KEY,
  PANELS_MENU_OPEN_DESIGN_PANEL_KEY,
  PANELS_MENU_OPEN_LAYERS_PANEL_KEY,
  PANELS_MENU_OPEN_PROTOTYPE_PANEL_KEY,
  PANELS_MENU_TOGGLE_VARIABLES_KEY,
} from './constants';

const { MenuItem } = MenuCompound;

const PanelsMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(PANELS_MENU_OPEN_LAYERS_PANEL_KEY)} shortcut={KEYBOARD_SHORTCUTS.openLayersPanel.join('')} />
      <MenuItem disabled label={t(PANELS_MENU_LIBRARIES_KEY)} shortcut={KEYBOARD_SHORTCUTS.openLibrariesPanel.join('')} />
      <MenuItem disabled label={t(PANELS_MENU_OPEN_DESIGN_PANEL_KEY)} shortcut={KEYBOARD_SHORTCUTS.openDesignPanel.join('')} />
      <MenuItem disabled label={t(PANELS_MENU_OPEN_PROTOTYPE_PANEL_KEY)} shortcut={KEYBOARD_SHORTCUTS.openPrototypePanel.join('')} />
      <MenuItem disabled label={t(PANELS_MENU_TOGGLE_VARIABLES_KEY)} />
    </>
  );
};

export default PanelsMenu;
