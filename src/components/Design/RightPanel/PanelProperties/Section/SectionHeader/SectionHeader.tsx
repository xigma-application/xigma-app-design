import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import SectionHeaderButtons from './SectionHeaderButtons';
import SectionHeaderMenu from './SectionHeaderMenu';

// others
import { translationNameSpace } from './constants';

const SectionHeader: FC = () => {
  const { t } = useTranslation();

  return (
    <PanelHeader
      buttons={<SectionHeaderButtons />}
      e2eValue="section"
      label={t(`${translationNameSpace}.label`)}
      menu={<SectionHeaderMenu />}
      menuAriaLabel={t(`${translationNameSpace}.menuAriaLabel`)}
    />
  );
};

export default SectionHeader;
