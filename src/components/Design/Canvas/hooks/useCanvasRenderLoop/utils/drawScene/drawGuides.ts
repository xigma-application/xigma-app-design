// others
import { GUIDE_STROKE } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs, TGuideDragState } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';
import { TGuideLine } from 'types/design/guides/types';
import { TLineSegment } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getFrameGuideSpan } from 'store/design/utils/getFrameGuideSpan';
import { drawLine } from 'utils/canvas/drawLine';
import { screenToWorld } from 'components/Design/Canvas/utils/screenToWorld';

const getGuideSegment = (guide: TGuideLine, canvasWidth: number, canvasHeight: number, viewport: TViewport): TLineSegment => {
  if (guide.span) {
    return guide.axis === 'x'
      ? { x1: guide.worldPosition, x2: guide.worldPosition, y1: guide.span.from, y2: guide.span.to }
      : { x1: guide.span.from, x2: guide.span.to, y1: guide.worldPosition, y2: guide.worldPosition };
  }

  const topLeft = screenToWorld({ x: 0, y: 0 }, viewport);
  const bottomRight = screenToWorld({ x: canvasWidth, y: canvasHeight }, viewport);

  return guide.axis === 'x'
    ? { x1: guide.worldPosition, x2: guide.worldPosition, y1: topLeft.y, y2: bottomRight.y }
    : { x1: topLeft.x, x2: bottomRight.x, y1: guide.worldPosition, y2: guide.worldPosition };
};

const getDraggingGuideLine = (dragging: TGuideDragState, nodesById: Record<string, TSceneNode>): TGuideLine => {
  const { axis, frameId, id, position } = dragging;

  if (frameId !== null) {
    const frame = nodesById[frameId];
    const span = frame?.type === NodeType.frame ? getFrameGuideSpan(frame, axis) : null;

    return { axis, frameId, id: id ?? '', span, worldPosition: position };
  }

  return { axis, frameId: null, id: id ?? '', span: null, worldPosition: position };
};

export const drawGuides = (
  context: TDrawSceneContext,
  guideLines: TGuideLine[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const strokeWidth = 1 / viewport.zoom;
  const dragging = refs.guides.draggingGuideRef.current;
  const committedLines = dragging?.id ? guideLines.filter((guide) => guide.id !== dragging.id) : guideLines;
  const lines = dragging ? [...committedLines, getDraggingGuideLine(dragging, nodesById)] : guideLines;

  lines.forEach((guide) => {
    const segment = getGuideSegment(guide, canvasWidth, canvasHeight, viewport);

    drawLine(gl, program, buffer, segment, GUIDE_STROKE, strokeWidth, canvasWidth, canvasHeight, viewport);
  });
};
