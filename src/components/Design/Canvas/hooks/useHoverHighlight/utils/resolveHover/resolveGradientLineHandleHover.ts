// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGradientEditorState } from 'store/design/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getGradientAddStopPositionAtPoint } from '../../../../utils/getGradientAddStopPositionAtPoint';

export const resolveGradientLineHandleHover = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
  gradientEditor: TGradientEditorState | null,
  refs: TCanvasRefs,
): void => {
  refs.hover.hoveredGradientLinePositionRef.current =
    getGradientAddStopPositionAtPoint(point, selectedNodes, viewport, gradientEditor)?.position ?? null;
};
