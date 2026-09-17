import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnPosition from '../../Common/PositionSection/ColumnPosition/ColumnPosition';
import ColumnRotation from '../../Common/PositionSection/ColumnRotation/ColumnRotation';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../Common/PositionSection/constants';

const ImageCropPositionSection: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.Section e2eValue="image-crop-position" label={t(`${translationNameSpace}.label`)}>
      <ColumnPosition />
      <ColumnRotation />
    </UITools.Section>
  );
};

export default ImageCropPositionSection;
