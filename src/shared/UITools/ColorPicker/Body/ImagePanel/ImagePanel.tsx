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
import { TImageAdjustments } from 'types/design/paint/types';
import { TImageFillMode } from './types';

// others
import { DEFAULT_IMAGE_ADJUSTMENTS } from 'constant/canvas';

export type TImagePanelProps = {
  adjustments?: TImageAdjustments;
  disabledFillModes?: TImageFillMode[];
  imagePanel: TUseImagePanelResult;
  onAdjustmentChange?: TFunc<[keyof TImageAdjustments, number]>;
  onRotate?: TFunc;
  onScaleModeChange?: TFunc<[TImageFillMode]>;
  onTileScaleChange?: TFunc<[number]>;
  tileScale?: number;
};

export const ImagePanel: FC<TImagePanelProps> = ({
  adjustments = DEFAULT_IMAGE_ADJUSTMENTS,
  disabledFillModes,
  imagePanel,
  onAdjustmentChange,
  onRotate,
  onScaleModeChange,
  onTileScaleChange,
  tileScale,
}) => {
  const handleFillModeChange = useHandleFillModeChange(imagePanel.setFillMode, onScaleModeChange);

  return (
    <div className={styles.ImagePanel}>
      <ImageFillModeRow
        disabledFillModes={disabledFillModes}
        fillMode={imagePanel.fillMode}
        onRotate={onRotate}
        onTileScaleChange={onTileScaleChange}
        setFillMode={handleFillModeChange}
        tileScale={tileScale}
      />
      <ImageSourcePreview imagePanel={imagePanel} />
      <ImageAdjustmentSliders adjustments={adjustments} onAdjustmentChange={onAdjustmentChange} />
    </div>
  );
};

export default ImagePanel;
