import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { CASE_MENU_LOWERCASE_KEY, CASE_MENU_ORIGINAL_CASE_KEY, CASE_MENU_UPPERCASE_KEY } from './constants';

const { MenuItem } = MenuCompound;

const CaseMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(CASE_MENU_ORIGINAL_CASE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(CASE_MENU_UPPERCASE_KEY)} withCheck={false} />
      <MenuItem disabled label={t(CASE_MENU_LOWERCASE_KEY)} withCheck={false} />
    </>
  );
};

export default CaseMenu;
