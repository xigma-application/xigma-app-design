import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import ImageCropAspectRatioMenu from './ImageCropAspectRatioMenu/ImageCropAspectRatioMenu';
import ToolbarButton from '../ToolbarButton/ToolbarButton';
import { UITools } from 'shared';

// hooks
import { useHandleFitClick } from './hooks/useHandleFitClick';
import { useImageCropToolbar } from './hooks/useImageCropToolbar';

// others
import { translationNameSpace, ZOOM_SLIDER_MAX, ZOOM_SLIDER_MIN } from './constants';

// styles
import styles from './image-crop-toolbar.module.scss';

const ImageCropToolbar: FC = () => {
  const { t } = useTranslation();
  const { isVisible, onZoomChange, zoom } = useImageCropToolbar();
  const handleFitClick = useHandleFitClick();

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.ImageCropToolbar}>
      <span className={styles.ImageCropToolbar__label}>{t(`${translationNameSpace}.label`)}</span>
      <div className={styles.ImageCropToolbar__separator} />
      <div className={styles.ImageCropToolbar__sliderBox}>
        <div className={styles.ImageCropToolbar__slider}>
          <UITools.Slider
            ariaLabel={t(`${translationNameSpace}.label`)}
            max={ZOOM_SLIDER_MAX}
            min={ZOOM_SLIDER_MIN}
            onChange={onZoomChange}
            value={zoom}
            variant="compact"
          />
        </div>
      </div>
      <ImageCropAspectRatioMenu />
      <ToolbarButton icon="FitLayout" isActive={false} onClick={handleFitClick} tooltip={t(`${translationNameSpace}.fit`)} />
      <div className={styles.ImageCropToolbar__separator} />
      <UITools.Button color="secondary" size="small" variant="outline">
        {t('common.cancel')}
      </UITools.Button>
      <UITools.Button ariaLabel={t(`${translationNameSpace}.confirm`)} size="small">
        <Icon color="onBlue1" name="Check" size={16} />
      </UITools.Button>
    </div>
  );
};

export default ImageCropToolbar;
