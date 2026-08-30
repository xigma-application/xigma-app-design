// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmShapeContactGuides = (canvasRefs: TCanvasRefs): void => {
  canvasRefs.transform.contactGuidesRef.current = null;
};
