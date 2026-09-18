import { useTranslation } from 'react-i18next';

// store
import { selectSelectedImageCrop } from 'components/Design/RightPanel/PanelProperties/Common/utils/selectSelectedImageCrop';
import { useAppSelector } from 'store';

// others
import { translationNameSpace } from '../constants';

export const useImageCropHeaderLabel = (): string => {
  const { t } = useTranslation();
  const imageCrop = useAppSelector(selectSelectedImageCrop);

  return imageCrop?.paint.type === 'video' ? t(`${translationNameSpace}.videoLabel`) : t(`${translationNameSpace}.label`);
};
