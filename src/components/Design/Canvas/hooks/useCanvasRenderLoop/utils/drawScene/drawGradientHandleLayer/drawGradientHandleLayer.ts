// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGradientEditorState } from 'store/design/types';
import { TGradientStop } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawGradientEndpointHandles } from './drawGradientEndpointHandles';
import { drawGradientLine } from './drawGradientLine';
import { drawGradientStopHandles } from './drawGradientStopHandles';
import { drawGradientStopValueLabel } from './drawGradientStopValueLabel';
import { getGradientStopHandlePositions } from './getGradientStopHandlePositions';
import { getGradientWorldPoints } from './getGradientWorldPoints';
import { getNodeBounds } from '../../../../../utils/getNodeBounds';
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

      drawGradientLine(gl, program, buffer, start, end, canvasWidth, canvasHeight, viewport);
      drawGradientEndpointHandles(gl, program, buffer, [start, end], canvasWidth, canvasHeight, viewport);
      drawGradientStopHandles(
        gl,
        program,
        buffer,
        paint.stops,
        stopPositions,
        gradientEditor.selectedStopIndex,
        canvasWidth,
        canvasHeight,
        viewport,
      );
      drawActiveGradientStopValueLabel(context, paint.stops, stopPositions, activeStopIndex);
    }
  }
};
