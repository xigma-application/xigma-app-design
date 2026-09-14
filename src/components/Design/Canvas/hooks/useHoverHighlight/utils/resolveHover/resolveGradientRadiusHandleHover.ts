// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientRadiusHandleAtPoint } from '../../../../utils/getGradientRadiusHandleAtPoint';

export const resolveGradientRadiusHandleHover = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredGradientRadiusHandleRef.current =
    getGradientRadiusHandleAtPoint(point, selectedNodes, viewport, gradientEditor)?.nodeId ?? null;
};
