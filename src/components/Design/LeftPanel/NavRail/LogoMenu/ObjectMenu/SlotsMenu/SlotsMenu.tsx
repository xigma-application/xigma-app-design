import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import { OBJECT_MENU_CONVERT_TO_FRAME_KEY } from '../constants';
import { SLOTS_MENU_CONVERT_TO_SLOT_KEY, SLOTS_MENU_RESET_SLOT_KEY, SLOTS_MENU_WRAP_IN_NEW_SLOT_KEY } from './constants';

const { MenuItem, MenuSeparator } = MenuCompound;

const SlotsMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(SLOTS_MENU_CONVERT_TO_SLOT_KEY)} shortcut={KEYBOARD_SHORTCUTS.convertToSlot.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(OBJECT_MENU_CONVERT_TO_FRAME_KEY)} withCheck={false} />
      <MenuItem disabled label={t(SLOTS_MENU_WRAP_IN_NEW_SLOT_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(SLOTS_MENU_RESET_SLOT_KEY)} withCheck={false} />
    </>
  );
};

export default SlotsMenu;
