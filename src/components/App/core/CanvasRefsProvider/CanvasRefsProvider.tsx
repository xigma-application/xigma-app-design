import { FC, useMemo, useRef } from 'react';

// hooks
import { usePencilRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/usePencilRefs/usePencilRefs';
import { useSliceRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useSliceRefs/useSliceRefs';
import { useStarRatioRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useStarRatioRefs/useStarRatioRefs';
import { useVectorCutRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorCutRefs/useVectorCutRefs';
import { useVectorEditRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorEditRefs/useVectorEditRefs';
import { useVectorEraseRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorEraseRefs/useVectorEraseRefs';
import { useVectorMultiSelectRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorMultiSelectRefs/useVectorMultiSelectRefs';
import { useCornerRadiusRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useCornerRadiusRefs/useCornerRadiusRefs';
import { useEllipseArcRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useEllipseArcRefs/useEllipseArcRefs';
import { useFrameNameRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useFrameNameRefs/useFrameNameRefs';
import { useGuideRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useGuideRefs/useGuideRefs';
import { useHoverRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useHoverRefs/useHoverRefs';
import { useLassoMarqueeRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useLassoMarqueeRefs/useLassoMarqueeRefs';
import { useLayoutRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useLayoutRefs/useLayoutRefs';
import { usePenRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/usePenRefs/usePenRefs';
import { useSectionNameRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useSectionNameRefs/useSectionNameRefs';
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

const CanvasRefsProvider: FC<TCanvasRefsProviderProps> = ({ children }) => {
  const cornerRadiusRefs = useCornerRadiusRefs();
  const ellipseArcRefs = useEllipseArcRefs();
  const frameNameRefs = useFrameNameRefs();
  const guideRefs = useGuideRefs();
  const hoverRefs = useHoverRefs();
  const lassoMarqueeRefs = useLassoMarqueeRefs();
  const layoutRefs = useLayoutRefs();
  const penRefs = usePenRefs();
  const sectionNameRefs = useSectionNameRefs();
  const transformRefs = useTransformRefs();
  const pencilRefs = usePencilRefs();
  const shapeBuilderRefs = useShapeBuilderRefs();
  const sliceRefs = useSliceRefs();
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

  const refs = useMemo<TCanvasRefs>(
    () => ({
      canvasRef,
      colorSampleRequestRef,
      cornerRadius: cornerRadiusRefs,
      draftRef,
      ellipseArc: ellipseArcRefs,
      frameName: frameNameRefs,
      guides: guideRefs,
      hover: hoverRefs,
      lassoMarquee: lassoMarqueeRefs,
      layout: layoutRefs,
      pen: penRefs,
      pencil: pencilRefs,
      sectionName: sectionNameRefs,
      shapeBuilder: shapeBuilderRefs,
      slice: sliceRefs,
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
      cornerRadiusRefs,
      ellipseArcRefs,
      frameNameRefs,
      guideRefs,
      hoverRefs,
      lassoMarqueeRefs,
      layoutRefs,
      penRefs,
      pencilRefs,
      sectionNameRefs,
      shapeBuilderRefs,
      sliceRefs,
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
