import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// hooks
import { useImageCropExpandButton } from './hooks/useImageCropExpandButton';

// others
import { ICON_SIZE } from './constants';

// styles
import styles from './image-crop-expand-button-overlay.module.scss';

const ImageCropExpandButtonOverlay: FC = () => {
  const { t } = useTranslation();
  const position = useImageCropExpandButton();

  if (!position) {
    return null;
  }

  return (
    <UITools.Button
      ariaLabel={t('design.toolbar.imageEditToolbar.expand')}
      className={styles.ImageCropExpandButtonOverlay}
      size="small"
      style={{ left: position.x, padding: 0, top: position.y, width: 24 }}
    >
      <Icon color="onBlue1" name="AiExpand" size={ICON_SIZE} />
    </UITools.Button>
  );
};

export default ImageCropExpandButtonOverlay;
