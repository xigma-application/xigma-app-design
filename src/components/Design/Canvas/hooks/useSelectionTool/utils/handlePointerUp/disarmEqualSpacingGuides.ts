// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmEqualSpacingGuides = (canvasRefs: TCanvasRefs): void => {
  canvasRefs.transform.equalSpacingGuidesRef.current = null;
};
