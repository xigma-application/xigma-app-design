import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import GroupHeaderButtons from './GroupHeaderButtons';
import GroupHeaderMenu from './GroupHeaderMenu';
import PanelHeader from '../../Common/PanelHeader/PanelHeader';

// others
import { translationNameSpace } from './constants';

const GroupHeader: FC = () => {
  const { t } = useTranslation();

  return (
    <PanelHeader
      buttons={<GroupHeaderButtons />}
      e2eValue="group"
      label={t(`${translationNameSpace}.label`)}
      menu={<GroupHeaderMenu />}
      menuAriaLabel={t(`${translationNameSpace}.menuAriaLabel`)}
    />
  );
};

export default GroupHeader;
