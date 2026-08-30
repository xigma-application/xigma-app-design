import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import {
  NEW_MENU_BUZZ_KEY,
  NEW_MENU_FIGJAM_KEY,
  NEW_MENU_IMPORT_FROM_SKETCH_KEY,
  NEW_MENU_MAKE_KEY,
  NEW_MENU_SITE_KEY,
  NEW_MENU_SLIDES_KEY,
} from './constants';

const { MenuItem, MenuSeparator } = MenuCompound;

const NewMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(NEW_MENU_FIGJAM_KEY)} withCheck={false} />
      <MenuItem disabled label={t(NEW_MENU_SLIDES_KEY)} withCheck={false} />
      <MenuItem disabled label={t(NEW_MENU_MAKE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(NEW_MENU_BUZZ_KEY)} withCheck={false} />
      <MenuItem disabled label={t(NEW_MENU_SITE_KEY)} withCheck={false} />
      <MenuSeparator />
      <MenuItem disabled label={t(NEW_MENU_IMPORT_FROM_SKETCH_KEY)} withCheck={false} />
    </>
  );
};

export default NewMenu;
