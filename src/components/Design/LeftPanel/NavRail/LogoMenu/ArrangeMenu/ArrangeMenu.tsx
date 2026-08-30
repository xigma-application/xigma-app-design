import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  ARRANGE_MENU_ALIGN_BOTTOM_KEY,
  ARRANGE_MENU_ALIGN_HORIZONTAL_CENTERS_KEY,
  ARRANGE_MENU_ALIGN_LEFT_KEY,
  ARRANGE_MENU_ALIGN_RIGHT_KEY,
  ARRANGE_MENU_ALIGN_TOP_KEY,
  ARRANGE_MENU_ALIGN_VERTICAL_CENTERS_KEY,
  ARRANGE_MENU_DISTRIBUTE_BOTTOM_KEY,
  ARRANGE_MENU_DISTRIBUTE_HORIZONTAL_CENTERS_KEY,
  ARRANGE_MENU_DISTRIBUTE_HORIZONTAL_SPACING_KEY,
  ARRANGE_MENU_DISTRIBUTE_LEFT_KEY,
  ARRANGE_MENU_DISTRIBUTE_RIGHT_KEY,
  ARRANGE_MENU_DISTRIBUTE_TOP_KEY,
  ARRANGE_MENU_DISTRIBUTE_VERTICAL_CENTERS_KEY,
  ARRANGE_MENU_DISTRIBUTE_VERTICAL_SPACING_KEY,
  ARRANGE_MENU_PACK_HORIZONTAL_KEY,
  ARRANGE_MENU_PACK_VERTICAL_KEY,
  ARRANGE_MENU_ROUND_TO_PIXEL_KEY,
  ARRANGE_MENU_TIDY_UP_KEY,
} from './constants';

const { MenuItem, MenuSeparator } = MenuCompound;

const ArrangeMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(ARRANGE_MENU_ROUND_TO_PIXEL_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(ARRANGE_MENU_ALIGN_LEFT_KEY)} shortcut={KEYBOARD_SHORTCUTS.alignLeft.join('')} withCheck={false} />
      <MenuItem
        disabled
        label={t(ARRANGE_MENU_ALIGN_HORIZONTAL_CENTERS_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.alignHorizontalCenters.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(ARRANGE_MENU_ALIGN_RIGHT_KEY)} shortcut={KEYBOARD_SHORTCUTS.alignRight.join('')} withCheck={false} />
      <MenuItem disabled label={t(ARRANGE_MENU_ALIGN_TOP_KEY)} shortcut={KEYBOARD_SHORTCUTS.alignTop.join('')} withCheck={false} />
      <MenuItem
        disabled
        label={t(ARRANGE_MENU_ALIGN_VERTICAL_CENTERS_KEY)}
        shortcut={KEYBOARD_SHORTCUTS.alignVerticalCenters.join('')}
        withCheck={false}
      />
      <MenuItem disabled label={t(ARRANGE_MENU_ALIGN_BOTTOM_KEY)} shortcut={KEYBOARD_SHORTCUTS.alignBottom.join('')} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(ARRANGE_MENU_TIDY_UP_KEY)} shortcut="⌃⌥T" withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(ARRANGE_MENU_PACK_HORIZONTAL_KEY)} withCheck={false} />
      <MenuItem disabled label={t(ARRANGE_MENU_PACK_VERTICAL_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(ARRANGE_MENU_DISTRIBUTE_HORIZONTAL_SPACING_KEY)} shortcut="⌃⌥H" withCheck={false} />
      <MenuItem disabled label={t(ARRANGE_MENU_DISTRIBUTE_VERTICAL_SPACING_KEY)} shortcut="⌃⌥V" withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(ARRANGE_MENU_DISTRIBUTE_LEFT_KEY)} withCheck={false} />
      <MenuItem disabled label={t(ARRANGE_MENU_DISTRIBUTE_HORIZONTAL_CENTERS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(ARRANGE_MENU_DISTRIBUTE_RIGHT_KEY)} withCheck={false} />
      <MenuItem disabled label={t(ARRANGE_MENU_DISTRIBUTE_TOP_KEY)} withCheck={false} />
      <MenuItem disabled label={t(ARRANGE_MENU_DISTRIBUTE_VERTICAL_CENTERS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(ARRANGE_MENU_DISTRIBUTE_BOTTOM_KEY)} withCheck={false} />
    </>
  );
};

export default ArrangeMenu;
