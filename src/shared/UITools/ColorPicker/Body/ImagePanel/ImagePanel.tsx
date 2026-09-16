import { FC } from 'react';

// components
import ImageAdjustmentSliders from './ImageAdjustmentSliders/ImageAdjustmentSliders';
import ImageFillModeRow from './ImageFillModeRow/ImageFillModeRow';
import ImageSourcePreview from './ImageSourcePreview/ImageSourcePreview';

// hooks
import { TUseImagePanelResult } from './hooks/useImagePanel';
import { useHandleFillModeChange } from './hooks/useHandleFillModeChange';

// styles
import styles from './image-panel.module.scss';

// types
import { TImageFillMode } from './types';

export type TImagePanelProps = { imagePanel: TUseImagePanelResult; onRotate?: TFunc; onScaleModeChange?: TFunc<[TImageFillMode]> };

export const ImagePanel: FC<TImagePanelProps> = ({ imagePanel, onRotate, onScaleModeChange }) => {
  const handleFillModeChange = useHandleFillModeChange(imagePanel.setFillMode, onScaleModeChange);

  return (
    <div className={styles.ImagePanel}>
      <ImageFillModeRow fillMode={imagePanel.fillMode} onRotate={onRotate} setFillMode={handleFillModeChange} />
      <ImageSourcePreview imagePanel={imagePanel} />
      <ImageAdjustmentSliders imagePanel={imagePanel} />
    </div>
  );
};

export default ImagePanel;
