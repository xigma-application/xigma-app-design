import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  OUTLINES_MENU_INCLUDE_HIDDEN_LAYERS_KEY,
  OUTLINES_MENU_INCLUDE_OBJECT_BOUNDS_KEY,
  OUTLINES_MENU_SHOW_OUTLINES_KEY,
} from './constants';

const { MenuItem, MenuSeparator } = MenuCompound;

const OutlinesMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(OUTLINES_MENU_SHOW_OUTLINES_KEY)} shortcut={KEYBOARD_SHORTCUTS.showOutlines.join('')} />
      <MenuSeparator />
      <MenuItem disabled label={t(OUTLINES_MENU_INCLUDE_HIDDEN_LAYERS_KEY)} selected />
      <MenuItem disabled label={t(OUTLINES_MENU_INCLUDE_OBJECT_BOUNDS_KEY)} />
    </>
  );
};

export default OutlinesMenu;
