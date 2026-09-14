// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientEditorState } from 'store/design/types';
import { TGradientPaint } from 'types/design/paint/types';
import { TDrawSceneContext } from '../types';
import { type TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

// utils
import { drawGradientEndpointHandles } from './drawGradientEndpointHandles';
import { drawGradientRadiusGuide } from './drawGradientRadiusGuide';
import { getGradientRadiusHandleWorldPoint } from './getGradientRadiusHandleWorldPoint';
import { isEllipseHandleGradientPaint } from 'components/Design/Canvas/utils/isEllipseHandleGradientPaint';

export const drawGradientRadiusHandles = (
  context: TDrawSceneContext,
  bounds: TDraftRect,
  selectedNode: TAppearanceNode,
  paint: TGradientPaint,
  start: TPoint,
  gradientEditor: TGradientEditorState,
  refs: TCanvasRefs,
): void => {
  if (isEllipseHandleGradientPaint(paint)) {
    const radiusHandle = getGradientRadiusHandleWorldPoint(bounds, selectedNode.rotation, paint);
    const radiusDragState = refs.gradientRadius.gradientRadiusDragRef.current;
    const isDraggingRadius = radiusDragState?.nodeId === selectedNode.id && radiusDragState?.paintIndex === gradientEditor.paintIndex;

    if (isDraggingRadius) {
      drawGradientRadiusGuide(context, start, radiusHandle);
    }

    drawGradientEndpointHandles(context, [radiusHandle]);
  }
};
