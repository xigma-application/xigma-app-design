// types
import { TCanvasRefs, TGradientRotateDragState } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientEditorState } from 'store/design/types';
import { TGradientPaint, TGradientStop } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawGradientAddStopPreview } from './drawGradientAddStopPreview';
import { drawGradientEndpointHandles } from './drawGradientEndpointHandles';
import { drawGradientLine } from './drawGradientLine';
import { drawGradientRadiusGuide } from './drawGradientRadiusGuide';
import { drawGradientRotateAngleLabel } from './drawGradientRotateAngleLabel';
import { drawGradientStopHandles } from './drawGradientStopHandles';
import { drawGradientStopValueLabel } from './drawGradientStopValueLabel';
import { getGradientPerpendicularOffsetDirection } from './getGradientPerpendicularOffsetDirection';
import { getGradientRadiusHandleWorldPoint } from './getGradientRadiusHandleWorldPoint';
import { getGradientStopHandlePositions, STOP_HANDLE_OFFSET_PX } from './getGradientStopHandlePositions';
import { getGradientWorldPoints } from './getGradientWorldPoints';
import { getInterpolatedGradientColor } from '../../../../../utils/getInterpolatedGradientColor';
import { getNodeBounds } from '../../../../../utils/getNodeBounds';
import { getPointAlongGradientLine } from '../../../../../utils/getPointAlongGradientLine';
import { isAppearanceNode, type TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isLineHandleGradientPaint } from '../../../../../utils/isLineHandleGradientPaint';

const drawActiveGradientStopValueLabel = (
  context: TDrawSceneContext,
  stops: TGradientStop[],
  stopPositions: TPoint[],
  awayFromLineDirection: TPoint,
  activeStopIndex: number | null,
): void => {
  if (activeStopIndex !== null && stops[activeStopIndex]) {
    drawGradientStopValueLabel(context, stopPositions[activeStopIndex], awayFromLineDirection, stops[activeStopIndex].position);
  }
};

const drawActiveGradientRotateAngleLabel = (
  context: TDrawSceneContext,
  start: TPoint,
  end: TPoint,
  isRotatingThisPaint: boolean,
  rotateDragState: TGradientRotateDragState | null,
  refs: TCanvasRefs,
): void => {
  const pointerPosition =
    isRotatingThisPaint && rotateDragState
      ? rotateDragState.pointerPosition
      : (refs.hover.hoveredGradientRotateEndpointRef.current?.pointerPosition ?? null);

  if (pointerPosition) {
    drawGradientRotateAngleLabel(context, pointerPosition, start, end);
  }
};

const drawGradientAddStopHoverPreview = (
  context: TDrawSceneContext,
  start: TPoint,
  end: TPoint,
  awayFromLineDirection: TPoint,
  stops: TGradientStop[],
  activeStopIndex: number | null,
  refs: TCanvasRefs,
): void => {
  const lineHoverPosition = refs.hover.hoveredGradientLinePositionRef.current;

  if (activeStopIndex === null && lineHoverPosition !== null) {
    const pointOnLine = getPointAlongGradientLine(start, end, lineHoverPosition);
    const offset = STOP_HANDLE_OFFSET_PX / context.viewport.zoom;
    const previewPosition: TPoint = {
      x: pointOnLine.x + awayFromLineDirection.x * offset,
      y: pointOnLine.y + awayFromLineDirection.y * offset,
    };
    const { color, opacity } = getInterpolatedGradientColor(stops, lineHoverPosition);
    const towardLineDirection: TPoint = { x: -awayFromLineDirection.x, y: -awayFromLineDirection.y };

    drawGradientAddStopPreview(context, previewPosition, towardLineDirection, color, opacity);
    drawGradientStopValueLabel(context, previewPosition, awayFromLineDirection, lineHoverPosition);
  }
};

const drawGradientRadiusHandles = (
  context: TDrawSceneContext,
  bounds: TDraftRect,
  selectedNode: TAppearanceNode,
  paint: TGradientPaint,
  start: TPoint,
  gradientEditor: TGradientEditorState,
  refs: TCanvasRefs,
): void => {
  if (paint.type === 'gradient-radial') {
    const radiusHandle = getGradientRadiusHandleWorldPoint(bounds, selectedNode.rotation, paint);
    const radiusDragState = refs.gradientRadius.gradientRadiusDragRef.current;
    const isDraggingRadius = radiusDragState?.nodeId === selectedNode.id && radiusDragState?.paintIndex === gradientEditor.paintIndex;

    if (isDraggingRadius) {
      drawGradientRadiusGuide(context, start, radiusHandle);
    }

    drawGradientEndpointHandles(context, [radiusHandle]);
  }
};

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
      const stopPositions = getGradientStopHandlePositions(start, end, paint.stops, context.viewport.zoom);
      const awayFromLineDirection = getGradientPerpendicularOffsetDirection(start, end);
      const towardLineDirection: TPoint = { x: -awayFromLineDirection.x, y: -awayFromLineDirection.y };
      const dragState = refs.gradientStop.gradientStopDragRef.current;
      const isDraggingThisPaint = dragState?.nodeId === selectedNode.id && dragState?.paintIndex === gradientEditor.paintIndex;
      const activeStopIndex = isDraggingThisPaint ? dragState.draggedStopIndex : refs.hover.hoveredGradientStopIndexRef.current;
      const rotateDragState = refs.gradientRotate.gradientRotateDragRef.current;
      const isRotatingThisPaint = rotateDragState?.nodeId === selectedNode.id && rotateDragState?.paintIndex === gradientEditor.paintIndex;
      const stops = paint.stops;
      const selectedStopIndex = gradientEditor.selectedStopIndex;

      drawGradientLine(context, start, end);
      drawGradientEndpointHandles(context, [start, end]);
      drawGradientStopHandles(context, stops, stopPositions, towardLineDirection, selectedStopIndex);
      drawActiveGradientStopValueLabel(context, stops, stopPositions, awayFromLineDirection, activeStopIndex);
      drawGradientAddStopHoverPreview(context, start, end, awayFromLineDirection, stops, activeStopIndex, refs);
      drawActiveGradientRotateAngleLabel(context, start, end, isRotatingThisPaint, rotateDragState, refs);
      drawGradientRadiusHandles(context, bounds, selectedNode, paint, start, gradientEditor, refs);
    }
  }
};
