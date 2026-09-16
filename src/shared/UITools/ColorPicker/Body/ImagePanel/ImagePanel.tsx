import { FC } from 'react';

// components
import ImageAdjustmentSliders from './ImageAdjustmentSliders/ImageAdjustmentSliders';
import ImageFillModeRow from './ImageFillModeRow/ImageFillModeRow';
import ImageSourcePreview from './ImageSourcePreview/ImageSourcePreview';

// hooks
import { TUseImagePanelResult } from './hooks/useImagePanel';

// styles
import styles from './image-panel.module.scss';

export type TImagePanelProps = { imagePanel: TUseImagePanelResult };

export const ImagePanel: FC<TImagePanelProps> = ({ imagePanel }) => (
  <div className={styles.ImagePanel}>
    <ImageFillModeRow fillMode={imagePanel.fillMode} setFillMode={imagePanel.setFillMode} />
    <ImageSourcePreview imagePanel={imagePanel} />
    <ImageAdjustmentSliders imagePanel={imagePanel} />
  </div>
);

export default ImagePanel;
