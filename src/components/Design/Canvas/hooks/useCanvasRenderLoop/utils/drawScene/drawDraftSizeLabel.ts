// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawLineSizeLabel } from './drawLineSizeLabel';
import { drawRectSizeLabel } from './drawRectSizeLabel';

export const drawDraftSizeLabel = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const draftShape = refs.draftRef.current;

  if (draftShape) {
    if (draftShape.type === NodeType.line) {
      drawLineSizeLabel(context, draftShape.x1, draftShape.y1, draftShape.x2, draftShape.y2);
    } else {
      drawRectSizeLabel(context, { ...draftShape, rotation: 0 });
    }
  }
};
