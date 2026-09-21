import { FC, useMemo, useRef } from 'react';

// hooks
import { usePencilRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/usePencilRefs/usePencilRefs';
import { useSliceRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useSliceRefs/useSliceRefs';
import { useStarRatioRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useStarRatioRefs/useStarRatioRefs';
import { useVectorCutRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorCutRefs/useVectorCutRefs';
import { useVectorEditRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorEditRefs/useVectorEditRefs';
import { useVectorEraseRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorEraseRefs/useVectorEraseRefs';
import { useVectorMultiSelectRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorMultiSelectRefs/useVectorMultiSelectRefs';
import { useBlendModeRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useBlendModeRefs/useBlendModeRefs';
import { useCornerRadiusRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useCornerRadiusRefs/useCornerRadiusRefs';
import { useEllipseArcRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useEllipseArcRefs/useEllipseArcRefs';
import { useFrameNameRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useFrameNameRefs/useFrameNameRefs';
import { useProgressiveBlurRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useProgressiveBlurRefs/useProgressiveBlurRefs';
import { useGradientEndpointMoveRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useGradientEndpointMoveRefs/useGradientEndpointMoveRefs';
import { useGradientRadiusRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useGradientRadiusRefs/useGradientRadiusRefs';
import { useGradientRotateRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useGradientRotateRefs/useGradientRotateRefs';
import { useGradientStopRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useGradientStopRefs/useGradientStopRefs';
import { useGuideRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useGuideRefs/useGuideRefs';
import { useHoverRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useHoverRefs/useHoverRefs';
import { useImageCropRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useImageCropRefs/useImageCropRefs';
import { useLassoMarqueeRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useLassoMarqueeRefs/useLassoMarqueeRefs';
import { useLayoutRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useLayoutRefs/useLayoutRefs';
import { useMediaRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useMediaRefs/useMediaRefs';
import { usePenRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/usePenRefs/usePenRefs';
import { useSectionNameRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useSectionNameRefs/useSectionNameRefs';
import { useSmartSelectionRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useSmartSelectionRefs/useSmartSelectionRefs';
import { useTransformRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useTransformRefs/useTransformRefs';
import { useShapeBuilderRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useShapeBuilderRefs/useShapeBuilderRefs';
import { useVectorPaintRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorPaintRefs/useVectorPaintRefs';
import { useVectorSnapshotsRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorSnapshotsRefs/useVectorSnapshotsRefs';
import { useVectorWidthRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorWidthRefs/useVectorWidthRefs';
import { useVertexCountRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVertexCountRefs/useVertexCountRefs';

// others
import { CanvasRefsContext } from './context';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TCanvasRefsProviderProps } from './types';
import { TColorSampleRequest } from 'utils/canvas/colorPixelSampler/types';
import { TDraftEntity } from 'types/design/types';
import { TExportRenderRequest } from 'utils/canvas/exportRender/types';
import { TPatternThumbnailRequest } from 'utils/canvas/patternThumbnail/types';

const CanvasRefsProvider: FC<TCanvasRefsProviderProps> = ({ children }) => {
  const blendModeRefs = useBlendModeRefs();
  const cornerRadiusRefs = useCornerRadiusRefs();
  const ellipseArcRefs = useEllipseArcRefs();
  const frameNameRefs = useFrameNameRefs();
  const gradientEndpointMoveRefs = useGradientEndpointMoveRefs();
  const gradientRadiusRefs = useGradientRadiusRefs();
  const gradientRotateRefs = useGradientRotateRefs();
  const gradientStopRefs = useGradientStopRefs();
  const guideRefs = useGuideRefs();
  const hoverRefs = useHoverRefs();
  const imageCropRefs = useImageCropRefs();
  const lassoMarqueeRefs = useLassoMarqueeRefs();
  const layoutRefs = useLayoutRefs();
  const mediaRefs = useMediaRefs();
  const penRefs = usePenRefs();
  const progressiveBlurRefs = useProgressiveBlurRefs();
  const sectionNameRefs = useSectionNameRefs();
  const transformRefs = useTransformRefs();
  const pencilRefs = usePencilRefs();
  const shapeBuilderRefs = useShapeBuilderRefs();
  const sliceRefs = useSliceRefs();
  const smartSelectionRefs = useSmartSelectionRefs();
  const starRatioRefs = useStarRatioRefs();
  const vectorCutRefs = useVectorCutRefs();
  const vectorEditRefs = useVectorEditRefs();
  const vectorEraseRefs = useVectorEraseRefs();
  const vectorMultiSelectRefs = useVectorMultiSelectRefs();
  const vectorPaintRefs = useVectorPaintRefs();
  const vectorSnapshotsRefs = useVectorSnapshotsRefs();
  const vectorWidthRefs = useVectorWidthRefs();
  const vertexCountRefs = useVertexCountRefs();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorSampleRequestRef = useRef<TColorSampleRequest | null>(null);
  const draftRef = useRef<TDraftEntity | null>(null);
  const exportRenderRequestRef = useRef<TExportRenderRequest | null>(null);
  const patternThumbnailRequestRef = useRef<TPatternThumbnailRequest | null>(null);

  const refs = useMemo<TCanvasRefs>(
    () => ({
      blendMode: blendModeRefs,
      canvasRef,
      colorSampleRequestRef,
      cornerRadius: cornerRadiusRefs,
      draftRef,
      ellipseArc: ellipseArcRefs,
      exportRenderRequestRef,
      frameName: frameNameRefs,
      gradientEndpointMove: gradientEndpointMoveRefs,
      gradientRadius: gradientRadiusRefs,
      gradientRotate: gradientRotateRefs,
      gradientStop: gradientStopRefs,
      guides: guideRefs,
      hover: hoverRefs,
      imageCrop: imageCropRefs,
      lassoMarquee: lassoMarqueeRefs,
      layout: layoutRefs,
      media: mediaRefs,
      patternThumbnailRequestRef,
      pen: penRefs,
      pencil: pencilRefs,
      progressiveBlur: progressiveBlurRefs,
      sectionName: sectionNameRefs,
      shapeBuilder: shapeBuilderRefs,
      slice: sliceRefs,
      smartSelection: smartSelectionRefs,
      starRatio: starRatioRefs,
      transform: transformRefs,
      vectorCut: vectorCutRefs,
      vectorEdit: vectorEditRefs,
      vectorErase: vectorEraseRefs,
      vectorMultiSelect: vectorMultiSelectRefs,
      vectorPaint: vectorPaintRefs,
      vectorSnapshots: vectorSnapshotsRefs,
      vectorWidth: vectorWidthRefs,
      vertexCount: vertexCountRefs,
    }),
    [
      blendModeRefs,
      cornerRadiusRefs,
      ellipseArcRefs,
      frameNameRefs,
      gradientEndpointMoveRefs,
      gradientRadiusRefs,
      gradientRotateRefs,
      gradientStopRefs,
      guideRefs,
      hoverRefs,
      imageCropRefs,
      lassoMarqueeRefs,
      layoutRefs,
      mediaRefs,
      penRefs,
      pencilRefs,
      progressiveBlurRefs,
      sectionNameRefs,
      shapeBuilderRefs,
      sliceRefs,
      smartSelectionRefs,
      starRatioRefs,
      transformRefs,
      vectorCutRefs,
      vectorEditRefs,
      vectorEraseRefs,
      vectorMultiSelectRefs,
      vectorPaintRefs,
      vectorSnapshotsRefs,
      vectorWidthRefs,
      vertexCountRefs,
    ],
  );

  return <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>;
};

export default CanvasRefsProvider;
