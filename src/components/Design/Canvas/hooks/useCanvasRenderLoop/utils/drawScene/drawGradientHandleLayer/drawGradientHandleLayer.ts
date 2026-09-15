// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGradientEditorState } from 'store/design/types';
import { TSceneNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawActiveGradientRotateAngleLabel } from './drawActiveGradientRotateAngleLabel';
import { drawActiveGradientStopValueLabel } from './drawActiveGradientStopValueLabel';
import { drawGradientAddStopHoverPreview } from './drawGradientAddStopHoverPreview';
import { drawGradientEllipseGuide } from './drawGradientEllipseGuide';
import { drawGradientEndpointHandles } from './drawGradientEndpointHandles';
import { drawGradientLine } from './drawGradientLine';
import { drawGradientRadiusHandles } from './drawGradientRadiusHandles';
import { drawGradientStopHandles } from './drawGradientStopHandles';
import { getGradientPerpendicularOffsetDirection } from './getGradientPerpendicularOffsetDirection';
import { getGradientStopDirections } from './getGradientStopDirections';
import { getGradientStopPositions } from './getGradientStopPositions';
import { getGradientWorldPoints } from './getGradientWorldPoints';
import { getNodeBounds } from '../../../../../utils/getNodeBounds';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from '../../../../../utils/isLineHandleGradientPaint';

export const drawGradientHandleLayer = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  gradientEditor: TGradientEditorState | null,
  refs: TCanvasRefs,
): void => {
  const [selectedNode] = selectedNodes;

  if (gradientEditor && selectedNodes.length === 1 && selectedNode.id === gradientEditor.nodeId && isAppearanceNode(selectedNode)) {
    const paint = selectedNode.fills[gradientEditor.paintIndex];

    if (isLineHandleGradientPaint(paint)) {
      const bounds = getNodeBounds(selectedNode);
      const { end, start } = getGradientWorldPoints(bounds, selectedNode.rotation, paint);
      const awayFromLineDirection = getGradientPerpendicularOffsetDirection(start, end);
      const stopPositions = getGradientStopPositions(bounds, selectedNode.rotation, paint, start, end, context.viewport.zoom);
      const stopDirections = getGradientStopDirections(bounds, selectedNode.rotation, paint, awayFromLineDirection);
      const towardLineDirections = stopDirections.map((direction) => ({ x: -direction.x, y: -direction.y }));
      const dragState = refs.gradientStop.gradientStopDragRef.current;
      const isDraggingThisPaint = dragState?.nodeId === selectedNode.id && dragState?.paintIndex === gradientEditor.paintIndex;
      const activeStopIndex = isDraggingThisPaint ? dragState.draggedStopIndex : refs.hover.hoveredGradientStopIndexRef.current;
      const rotateDragState = refs.gradientRotate.gradientRotateDragRef.current;
      const isRotatingThisPaint = rotateDragState?.nodeId === selectedNode.id && rotateDragState?.paintIndex === gradientEditor.paintIndex;
      const stops = paint.stops;
      const selectedStopIndex = gradientEditor.selectedStopIndex;

      drawGradientEllipseGuide(context, bounds, selectedNode.rotation, paint);
      drawGradientLine(context, start, end);
      drawGradientEndpointHandles(context, [start, end]);
      drawGradientStopHandles(context, stops, stopPositions, towardLineDirections, selectedStopIndex);
      drawActiveGradientStopValueLabel(context, stops, stopPositions, stopDirections, activeStopIndex);
      drawGradientAddStopHoverPreview(
        context,
        bounds,
        selectedNode.rotation,
        paint,
        start,
        end,
        awayFromLineDirection,
        stops,
        activeStopIndex,
        refs,
      );
      drawActiveGradientRotateAngleLabel(context, start, end, isRotatingThisPaint, rotateDragState, refs);
      drawGradientRadiusHandles(context, bounds, selectedNode, paint, start, gradientEditor, refs);
    }
  }
};
