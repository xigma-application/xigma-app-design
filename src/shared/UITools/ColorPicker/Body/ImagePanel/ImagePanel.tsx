import { FC } from 'react';

// components
import ImageAdjustmentSliders from './ImageAdjustmentSliders/ImageAdjustmentSliders';
import ImageFillModeRow from './ImageFillModeRow/ImageFillModeRow';
import ImageSourcePreview from './ImageSourcePreview/ImageSourcePreview';

// hooks
import { useImagePanel } from './hooks/useImagePanel';

// styles
import styles from './image-panel.module.scss';

export const ImagePanel: FC = () => {
  const imagePanel = useImagePanel();

  return (
    <div className={styles.ImagePanel}>
      <ImageFillModeRow fillMode={imagePanel.fillMode} setFillMode={imagePanel.setFillMode} />
      <ImageSourcePreview />
      <ImageAdjustmentSliders imagePanel={imagePanel} />
    </div>
  );
};

export default ImagePanel;
