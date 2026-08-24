// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const updateRawPreview = (event: PointerEvent, refs: TCanvasRefs, rawPoints: TPoint[], currentPoint: TPoint): void => {
  const showRawPreview = event.ctrlKey || event.metaKey;

  rawPoints.push(currentPoint);
  refs.pencilShowRawPreviewRef.current = showRawPreview;
  refs.pencilRawPreviewPointsRef.current = showRawPreview ? [...rawPoints] : null;
};
