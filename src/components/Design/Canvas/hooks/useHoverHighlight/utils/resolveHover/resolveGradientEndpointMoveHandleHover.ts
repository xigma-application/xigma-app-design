// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientEndpointMoveHandleAtPoint } from '../../../../utils/getGradientEndpointMoveHandleAtPoint';

export const resolveGradientEndpointMoveHandleHover = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredGradientEndpointMoveRef.current =
    getGradientEndpointMoveHandleAtPoint(point, selectedNodes, viewport, gradientEditor)?.endpoint ?? null;
};
