// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientStopHandleAtPoint } from '../../../../utils/getGradientStopHandleAtPoint';

export const resolveGradientStopHandleHover = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredGradientStopIndexRef.current =
    getGradientStopHandleAtPoint(point, selectedNodes, viewport, gradientEditor)?.stopIndex ?? null;
};
