import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnDimensions from '../../Common/ColumnDimensions/ColumnDimensions';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../Common/constants';

const ImageCropDimensionsSection: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.Section e2eValue="image-crop-layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
      <ColumnDimensions />
    </UITools.Section>
  );
};

export default ImageCropDimensionsSection;
