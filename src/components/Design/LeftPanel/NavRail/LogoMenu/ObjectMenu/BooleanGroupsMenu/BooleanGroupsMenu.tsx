import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  BOOLEAN_GROUPS_MENU_EXCLUDE_KEY,
  BOOLEAN_GROUPS_MENU_INTERSECT_KEY,
  BOOLEAN_GROUPS_MENU_SUBTRACT_KEY,
  BOOLEAN_GROUPS_MENU_UNION_KEY,
} from './constants';

const { MenuItem } = MenuCompound;

const BooleanGroupsMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(BOOLEAN_GROUPS_MENU_UNION_KEY)} shortcut={KEYBOARD_SHORTCUTS.booleanUnion.join('')} withCheck={false} />
      <MenuItem
        disabled
        label={t(BOOLEAN_GROUPS_MENU_SUBTRACT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.booleanSubtract.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(BOOLEAN_GROUPS_MENU_INTERSECT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.booleanIntersect.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(BOOLEAN_GROUPS_MENU_EXCLUDE_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.booleanExclude.join('')}
        withCheck={false}
      />
    </>
  );
};

export default BooleanGroupsMenu;
