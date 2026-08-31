// types
import { TSceneNode } from 'types/design/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { drawVectorWidthPointHoverMarker } from './drawVectorWidthPointHoverMarker';
import { drawVectorWidthPointsForNode } from './drawVectorWidthPointsForNode';
import { drawVectorWidthValueLabel } from './drawVectorWidthValueLabel';

export const drawVectorWidthPointsPreview = (
  context: TDrawSceneContext,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  refs: TCanvasRefs,
  activeTool: ToolName,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;

  if (activeTool === ToolName.variableWidth) {
    vectorEditingNodeIds.forEach((nodeId) => {
      drawVectorWidthPointsForNode(gl, program, buffer, nodes, nodeId, refs, canvasWidth, canvasHeight, viewport);
    });

    drawVectorWidthPointHoverMarker(
      gl,
      program,
      buffer,
      nodes,
      refs.hover.hoveredVectorWidthPointRef.current,
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawVectorWidthValueLabel(gl, program, buffer, imageContext, nodes, refs, canvasWidth, canvasHeight, viewport);
  }
};
