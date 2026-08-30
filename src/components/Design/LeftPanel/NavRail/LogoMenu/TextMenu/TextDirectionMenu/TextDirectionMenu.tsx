import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { MenuCompound } from 'shared';

// others
import { TEXT_DIRECTION_MENU_LEFT_TO_RIGHT_KEY, TEXT_DIRECTION_MENU_RIGHT_TO_LEFT_KEY } from './constants';

const { MenuItem } = MenuCompound;

const TextDirectionMenu: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem disabled label={t(TEXT_DIRECTION_MENU_LEFT_TO_RIGHT_KEY)} withCheck={false} />
      <MenuItem disabled label={t(TEXT_DIRECTION_MENU_RIGHT_TO_LEFT_KEY)} withCheck={false} />
    </>
  );
};

export default TextDirectionMenu;
