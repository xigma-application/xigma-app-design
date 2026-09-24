// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const hasRectRenderOverrides = (refs: TCanvasRefs): boolean => {
  const { autoLayoutDropTargetRef, autoLayoutReorderPreviewRef, gridDragGhostRef, gridDropTargetRef } = refs.transform;

  return (
    autoLayoutDropTargetRef.current !== null ||
    autoLayoutReorderPreviewRef.current !== null ||
    gridDragGhostRef.current !== null ||
    gridDropTargetRef.current !== null
  );
};
