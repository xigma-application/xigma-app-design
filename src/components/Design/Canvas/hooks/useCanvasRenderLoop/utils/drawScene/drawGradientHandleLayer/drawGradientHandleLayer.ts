// types
import { TGradientEditorState } from 'store/design/types';
import { TSceneNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawGradientEndpointHandles } from './drawGradientEndpointHandles';
import { drawGradientLine } from './drawGradientLine';
import { drawGradientStopHandles } from './drawGradientStopHandles';
import { getGradientStopHandlePositions } from './getGradientStopHandlePositions';
import { getGradientWorldPoints } from './getGradientWorldPoints';
import { getNodeBounds } from '../../../../../utils/getNodeBounds';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export const drawGradientHandleLayer = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  gradientEditor: TGradientEditorState | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const [selectedNode] = selectedNodes;

  if (gradientEditor && selectedNodes.length === 1 && selectedNode.id === gradientEditor.nodeId && isAppearanceNode(selectedNode)) {
    const paint = selectedNode.fills[gradientEditor.paintIndex];

    if (paint?.type === 'gradient-linear') {
      const bounds = getNodeBounds(selectedNode);
      const { end, start } = getGradientWorldPoints(bounds, selectedNode.rotation, paint);
      const stopPositions = getGradientStopHandlePositions(start, end, paint.stops, viewport.zoom);

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
    }
  }
};
