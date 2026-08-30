import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  ALIGNMENT_MENU_TEXT_ALIGN_BOTTOM_KEY,
  ALIGNMENT_MENU_TEXT_ALIGN_CENTER_KEY,
  ALIGNMENT_MENU_TEXT_ALIGN_JUSTIFIED_KEY,
  ALIGNMENT_MENU_TEXT_ALIGN_LEFT_KEY,
  ALIGNMENT_MENU_TEXT_ALIGN_MIDDLE_KEY,
  ALIGNMENT_MENU_TEXT_ALIGN_RIGHT_KEY,
  ALIGNMENT_MENU_TEXT_ALIGN_TOP_KEY,
} from './constants';

const { MenuItem, MenuSeparator } = MenuCompound;

const AlignmentMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem
        disabled
        label={t(ALIGNMENT_MENU_TEXT_ALIGN_LEFT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.textAlignLeft.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ALIGNMENT_MENU_TEXT_ALIGN_CENTER_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.textAlignCenter.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ALIGNMENT_MENU_TEXT_ALIGN_RIGHT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.textAlignRight.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ALIGNMENT_MENU_TEXT_ALIGN_JUSTIFIED_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.textAlignJustified.join('')}
        withCheck={false}
      />
      <MenuSeparator />
      <MenuItem disabled label={t(ALIGNMENT_MENU_TEXT_ALIGN_TOP_KEY)} withCheck={false} />
      <MenuItem disabled label={t(ALIGNMENT_MENU_TEXT_ALIGN_MIDDLE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(ALIGNMENT_MENU_TEXT_ALIGN_BOTTOM_KEY)} withCheck={false} />
    </>
  );
};

export default AlignmentMenu;
