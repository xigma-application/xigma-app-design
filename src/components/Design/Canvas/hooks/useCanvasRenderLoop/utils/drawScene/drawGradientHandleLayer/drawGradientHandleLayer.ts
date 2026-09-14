// types
import { TCanvasRefs, TGradientRotateDragState } from 'types/design/canvas/types';
import { TGradientEditorState } from 'store/design/types';
import { TGradientStop } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawGradientAddStopPreview } from './drawGradientAddStopPreview';
import { drawGradientEndpointHandles } from './drawGradientEndpointHandles';
import { drawGradientLine } from './drawGradientLine';
import { drawGradientRotateAngleLabel } from './drawGradientRotateAngleLabel';
import { drawGradientStopHandles } from './drawGradientStopHandles';
import { drawGradientStopValueLabel } from './drawGradientStopValueLabel';
import { getGradientStopHandlePositions, STOP_HANDLE_OFFSET_PX } from './getGradientStopHandlePositions';
import { getGradientWorldPoints } from './getGradientWorldPoints';
import { getInterpolatedGradientColor } from '../../../../../utils/getInterpolatedGradientColor';
import { getNodeBounds } from '../../../../../utils/getNodeBounds';
import { getPointAlongGradientLine } from '../../../../../utils/getPointAlongGradientLine';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

const drawActiveGradientStopValueLabel = (
  context: TDrawSceneContext,
  stops: TGradientStop[],
  stopPositions: TPoint[],
  activeStopIndex: number | null,
): void => {
  if (activeStopIndex !== null && stops[activeStopIndex]) {
    drawGradientStopValueLabel(context, stopPositions[activeStopIndex], stops[activeStopIndex].position);
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
  const pointerPosition = isRotatingThisPaint && rotateDragState
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
  stops: TGradientStop[],
  activeStopIndex: number | null,
  lineHoverPosition: number | null,
): void => {
  if (activeStopIndex === null && lineHoverPosition !== null) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const pointOnLine = getPointAlongGradientLine(start, end, lineHoverPosition);
    const previewPosition: TPoint = { x: pointOnLine.x, y: pointOnLine.y - STOP_HANDLE_OFFSET_PX / viewport.zoom };
    const { color, opacity } = getInterpolatedGradientColor(stops, lineHoverPosition);

    drawGradientAddStopPreview(gl, program, buffer, previewPosition, color, opacity, canvasWidth, canvasHeight, viewport);
    drawGradientStopValueLabel(context, previewPosition, lineHoverPosition);
  }
};

export const drawGradientHandleLayer = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  gradientEditor: TGradientEditorState | null,
  refs: TCanvasRefs,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const [selectedNode] = selectedNodes;

  if (gradientEditor && selectedNodes.length === 1 && selectedNode.id === gradientEditor.nodeId && isAppearanceNode(selectedNode)) {
    const paint = selectedNode.fills[gradientEditor.paintIndex];

    if (paint?.type === 'gradient-linear') {
      const bounds = getNodeBounds(selectedNode);
      const { end, start } = getGradientWorldPoints(bounds, selectedNode.rotation, paint);
      const stopPositions = getGradientStopHandlePositions(start, end, paint.stops, viewport.zoom);
      const dragState = refs.gradientStop.gradientStopDragRef.current;
      const isDraggingThisPaint = dragState?.nodeId === selectedNode.id && dragState?.paintIndex === gradientEditor.paintIndex;
      const activeStopIndex = isDraggingThisPaint ? dragState.draggedStopIndex : refs.hover.hoveredGradientStopIndexRef.current;
      const rotateDragState = refs.gradientRotate.gradientRotateDragRef.current;
      const isRotatingThisPaint = rotateDragState?.nodeId === selectedNode.id && rotateDragState?.paintIndex === gradientEditor.paintIndex;
      const stops = paint.stops;
      const selectedStopIndex = gradientEditor.selectedStopIndex;

      drawGradientLine(gl, program, buffer, start, end, canvasWidth, canvasHeight, viewport);
      drawGradientEndpointHandles(gl, program, buffer, [start, end], canvasWidth, canvasHeight, viewport);
      drawGradientStopHandles(gl, program, buffer, stops, stopPositions, selectedStopIndex, canvasWidth, canvasHeight, viewport);
      drawActiveGradientStopValueLabel(context, stops, stopPositions, activeStopIndex);
      drawGradientAddStopHoverPreview(context, start, end, stops, activeStopIndex, refs.hover.hoveredGradientLinePositionRef.current);
      drawActiveGradientRotateAngleLabel(context, start, end, isRotatingThisPaint, rotateDragState, refs);
    }
  }
};
