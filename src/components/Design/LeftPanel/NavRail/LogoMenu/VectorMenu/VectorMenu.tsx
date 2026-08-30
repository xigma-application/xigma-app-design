import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  VECTOR_MENU_DELETE_AND_HEAL_SELECTION_KEY,
  VECTOR_MENU_JOIN_SELECTION_KEY,
  VECTOR_MENU_OFFSET_VECTOR_KEY,
  VECTOR_MENU_SIMPLIFY_VECTOR_KEY,
  VECTOR_MENU_SMOOTH_JOIN_SELECTION_KEY,
  VECTOR_MENU_SPLIT_VECTOR_KEY,
} from './constants';

const { MenuItem } = MenuCompound;

const VectorMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(VECTOR_MENU_JOIN_SELECTION_KEY)} shortcut={KEYBOARD_SHORTCUTS.joinSelection.join('')} withCheck={false} />
      <MenuItem
        disabled
        label={t(VECTOR_MENU_SMOOTH_JOIN_SELECTION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.smoothJoinSelection.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(VECTOR_MENU_DELETE_AND_HEAL_SELECTION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.deleteAndHealSelection.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(VECTOR_MENU_SPLIT_VECTOR_KEY)} withCheck={false} />
      <MenuItem disabled label={t(VECTOR_MENU_SIMPLIFY_VECTOR_KEY)} withCheck={false} />
      <MenuItem disabled label={t(VECTOR_MENU_OFFSET_VECTOR_KEY)} withCheck={false} />
    </>
  );
};

export default VectorMenu;
