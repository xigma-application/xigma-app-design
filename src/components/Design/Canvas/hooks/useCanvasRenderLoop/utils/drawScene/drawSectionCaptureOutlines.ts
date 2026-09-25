// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawHoverOutline } from './drawHoverOutline';

export const drawSectionCaptureOutlines = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  vectorEditingNodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): void => {
  refs.transform.sectionCaptureIdsRef.current.forEach((id) => drawHoverOutline(context, nodesById[id], vectorEditingNodeIds, nodesById));
};
