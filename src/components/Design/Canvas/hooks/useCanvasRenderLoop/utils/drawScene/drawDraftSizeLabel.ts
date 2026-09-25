// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawRectSizeLabel } from './drawRectSizeLabel';

export const drawDraftSizeLabel = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const draftShape = refs.draftRef.current;

  if (draftShape) {
    drawRectSizeLabel(context, { ...draftShape, rotation: 0 });
  }
};
