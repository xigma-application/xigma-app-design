import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  ADJUST_MENU_DECREASE_FONT_SIZE_KEY,
  ADJUST_MENU_DECREASE_FONT_WEIGHT_KEY,
  ADJUST_MENU_DECREASE_INDENTATION_KEY,
  ADJUST_MENU_DECREASE_LETTER_SPACING_KEY,
  ADJUST_MENU_DECREASE_LINE_HEIGHT_KEY,
  ADJUST_MENU_INCREASE_FONT_SIZE_KEY,
  ADJUST_MENU_INCREASE_FONT_WEIGHT_KEY,
  ADJUST_MENU_INCREASE_INDENTATION_KEY,
  ADJUST_MENU_INCREASE_LETTER_SPACING_KEY,
  ADJUST_MENU_INCREASE_LINE_HEIGHT_KEY,
} from './constants';

const { MenuItem } = MenuCompound;

const AdjustMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem
        disabled
        label={t(ADJUST_MENU_INCREASE_INDENTATION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.increaseIndentation.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_DECREASE_INDENTATION_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.decreaseIndentation.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_INCREASE_FONT_SIZE_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.increaseFontSize.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_DECREASE_FONT_SIZE_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.decreaseFontSize.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_INCREASE_FONT_WEIGHT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.increaseFontWeight.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_DECREASE_FONT_WEIGHT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.decreaseFontWeight.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_INCREASE_LINE_HEIGHT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.increaseLineHeight.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_DECREASE_LINE_HEIGHT_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.decreaseLineHeight.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_INCREASE_LETTER_SPACING_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.increaseLetterSpacing.join('')}
        withCheck={false}
      />
      <MenuItem
        disabled
        label={t(ADJUST_MENU_DECREASE_LETTER_SPACING_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.decreaseLetterSpacing.join('')}
        withCheck={false}
      />
    </>
  );
};

export default AdjustMenu;
