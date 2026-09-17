import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import PanelHeader from '../../Common/PanelHeader/PanelHeader';

// others
import { translationNameSpace } from './constants';

const ImageCropHeader: FC = () => {
  const { t } = useTranslation();

  return <PanelHeader buttons={null} e2eValue="image-crop" label={t(`${translationNameSpace}.label`)} />;
};

export default ImageCropHeader;
