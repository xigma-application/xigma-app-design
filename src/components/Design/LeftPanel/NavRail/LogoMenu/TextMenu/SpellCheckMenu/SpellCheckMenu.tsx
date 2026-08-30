import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { SPELL_CHECK_LANGUAGES, SPELL_CHECK_MENU_AUTO_DETECT_LANGUAGE_KEY, SPELL_CHECK_MENU_CHECK_SPELLING_KEY } from './constants';

const { MenuItem, MenuSeparator } = MenuCompound;

const SpellCheckMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(SPELL_CHECK_MENU_CHECK_SPELLING_KEY)} selected />
      <MenuSeparator />
      <MenuItem disabled label={t(SPELL_CHECK_MENU_AUTO_DETECT_LANGUAGE_KEY)} selected />
      {SPELL_CHECK_LANGUAGES.map((language) => (
        <MenuItem disabled key={language} label={language} />
      ))}
    </>
  );
};

export default SpellCheckMenu;
