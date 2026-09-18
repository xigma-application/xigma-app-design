import { ReactNode } from 'react';

// components
import GradientPanel from '../GradientPanel/GradientPanel';
import ImagePanel from '../ImagePanel/ImagePanel';
import PatternPanel from '../PatternPanel/PatternPanel';
import SolidPanel from '../SolidPanel/SolidPanel';
import VideoPanel from '../VideoPanel/VideoPanel';

// types
import { ColorPickerTab } from '../../enums';
import { TBodyProps } from '../types';

export const renderBody = (props: TBodyProps): ReactNode => {
  const {
    activeTab,
    alpha,
    colorModel,
    gradientPanel,
    imageAdjustments,
    imagePanel,
    imageTileScale,
    onCloseSampler,
    onDragEnd,
    onDragStart,
    onImageAdjustmentChange,
    onImageRotate,
    onImageScaleModeChange,
    onImageTileScaleChange,
    onOpenSampler,
    onVideoRotate,
    onVideoScaleModeChange,
    onVideoTileScaleChange,
    patternPanel,
    patternSourceNodeId,
    patternSourcePicking,
    videoPanel,
    videoTileScale,
  } = props;

  switch (activeTab) {
    case ColorPickerTab.gradient:
      return <GradientPanel gradientPanel={gradientPanel} onDragEnd={onDragEnd} onDragStart={onDragStart} />;
    case ColorPickerTab.pattern:
      return (
        <PatternPanel
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          patternPanel={patternPanel}
          patternSourcePicking={patternSourcePicking}
          sourceNodeId={patternSourceNodeId}
        />
      );
    case ColorPickerTab.image:
      return (
        <ImagePanel
          adjustments={imageAdjustments}
          imagePanel={imagePanel}
          onAdjustmentChange={onImageAdjustmentChange}
          onRotate={onImageRotate}
          onScaleModeChange={onImageScaleModeChange}
          onTileScaleChange={onImageTileScaleChange}
          tileScale={imageTileScale}
        />
      );
    case ColorPickerTab.video:
      return (
        <VideoPanel
          onRotate={onVideoRotate}
          onScaleModeChange={onVideoScaleModeChange}
          onTileScaleChange={onVideoTileScaleChange}
          tileScale={videoTileScale}
          videoPanel={videoPanel}
        />
      );
    case ColorPickerTab.shader:
      return null;
    default:
      return (
        <SolidPanel
          alpha={alpha}
          colorModel={colorModel}
          onCloseSampler={onCloseSampler}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onOpenSampler={onOpenSampler}
        />
      );
  }
};
