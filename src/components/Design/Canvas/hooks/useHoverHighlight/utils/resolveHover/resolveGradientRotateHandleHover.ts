// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientRotateHandleAtPoint } from '../../../../utils/getGradientRotateHandleAtPoint';

export const resolveGradientRotateHandleHover = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
  refs: TCanvasRefs,
): void => {
  const hit = getGradientRotateHandleAtPoint(point, selectedNodes, viewport, gradientEditor);
  refs.hover.hoveredGradientRotateEndpointRef.current = hit ? { endpoint: hit.endpoint, pointerPosition: point } : null;
};
