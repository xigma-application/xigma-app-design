import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { KEYBOARD_SHORTCUTS } from 'components/Design/keys';
import {
  COPY_AS_MENU_ANIMATED_SVG_KEY,
  COPY_AS_MENU_CSS_ALL_LAYERS_KEY,
  COPY_AS_MENU_CSS_KEY,
  COPY_AS_MENU_PNG_KEY,
  COPY_AS_MENU_SVG_KEY,
  COPY_AS_MENU_TEXT_KEY,
} from './constants';

const { MenuItem } = MenuCompound;

const CopyAsMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(COPY_AS_MENU_TEXT_KEY)} withCheck={false} />
      <MenuItem disabled label={t(COPY_AS_MENU_CSS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(COPY_AS_MENU_CSS_ALL_LAYERS_KEY)} withCheck={false} />
      <MenuItem disabled label={t(COPY_AS_MENU_SVG_KEY)} withCheck={false} />
      <MenuItem disabled label={t(COPY_AS_MENU_ANIMATED_SVG_KEY)} withCheck={false} />
      <MenuItem disabled label={t(COPY_AS_MENU_PNG_KEY)} shortcut={KEYBOARD_SHORTCUTS.copyAsPng.join('')} withCheck={false} />
    </>
  );
};

export default CopyAsMenu;
