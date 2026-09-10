import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FrameHeaderButtons from './FrameHeaderButtons';
import FrameHeaderMenu from './FrameHeaderMenu';
import PanelHeader from '../../Common/PanelHeader/PanelHeader';

// others
import { translationNameSpace } from './constants';

const FrameHeader: FC = () => {
  const { t } = useTranslation();

  return (
    <PanelHeader
      buttons={<FrameHeaderButtons />}
      e2eValue="frame"
      label={t(`${translationNameSpace}.label`)}
      menu={<FrameHeaderMenu />}
      menuAriaLabel={t(`${translationNameSpace}.menuAriaLabel`)}
    />
  );
};

export default FrameHeader;
