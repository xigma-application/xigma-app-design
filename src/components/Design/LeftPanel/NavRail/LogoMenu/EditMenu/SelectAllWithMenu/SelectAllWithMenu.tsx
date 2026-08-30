import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import {
  SELECT_ALL_WITH_MENU_SAME_EFFECT_KEY,
  SELECT_ALL_WITH_MENU_SAME_FILL_KEY,
  SELECT_ALL_WITH_MENU_SAME_FONT_KEY,
  SELECT_ALL_WITH_MENU_SAME_INSTANCE_KEY,
  SELECT_ALL_WITH_MENU_SAME_PROPERTIES_KEY,
  SELECT_ALL_WITH_MENU_SAME_STROKE_KEY,
  SELECT_ALL_WITH_MENU_SAME_TEXT_PROPERTIES_KEY,
  SELECT_ALL_WITH_MENU_SAME_VARIANT_KEY,
} from './constants';

const { MenuItem } = MenuCompound;

const SelectAllWithMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(SELECT_ALL_WITH_MENU_SAME_PROPERTIES_KEY)} withCheck={false} />
      <MenuItem disabled label={t(SELECT_ALL_WITH_MENU_SAME_FILL_KEY)} withCheck={false} />
      <MenuItem disabled label={t(SELECT_ALL_WITH_MENU_SAME_STROKE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(SELECT_ALL_WITH_MENU_SAME_EFFECT_KEY)} withCheck={false} />
      <MenuItem disabled label={t(SELECT_ALL_WITH_MENU_SAME_TEXT_PROPERTIES_KEY)} withCheck={false} />
      <MenuItem disabled label={t(SELECT_ALL_WITH_MENU_SAME_FONT_KEY)} withCheck={false} />
      <MenuItem disabled label={t(SELECT_ALL_WITH_MENU_SAME_INSTANCE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(SELECT_ALL_WITH_MENU_SAME_VARIANT_KEY)} withCheck={false} />
    </>
  );
};

export default SelectAllWithMenu;
