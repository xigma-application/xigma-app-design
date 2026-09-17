import { ReactNode } from 'react';

// components
import GradientPanel from '../GradientPanel/GradientPanel';
import ImagePanel from '../ImagePanel/ImagePanel';
import PatternPanel from '../PatternPanel/PatternPanel';
import SolidPanel from '../SolidPanel/SolidPanel';

// types
import { ColorPickerTab } from '../../enums';
import { TBodyProps } from '../types';

export const renderBody = (props: TBodyProps): ReactNode => {
  const {
    activeTab,
    alpha,
    colorModel,
    gradientPanel,
    imagePanel,
    imageTileScale,
    onCloseSampler,
    onDragEnd,
    onDragStart,
    onImageRotate,
    onImageScaleModeChange,
    onImageTileScaleChange,
    onOpenSampler,
    patternPanel,
    patternSourceNodeId,
    patternSourcePicking,
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
          imagePanel={imagePanel}
          onRotate={onImageRotate}
          onScaleModeChange={onImageScaleModeChange}
          onTileScaleChange={onImageTileScaleChange}
          tileScale={imageTileScale}
        />
      );
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
