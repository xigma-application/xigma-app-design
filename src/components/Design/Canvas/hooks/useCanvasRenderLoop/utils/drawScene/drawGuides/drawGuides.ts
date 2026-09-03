// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TGuideLine } from 'types/design/guides/types';
import { TSceneNode } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { getDraggingGuideLine } from './getDraggingGuideLine';
import { getGuideSegment } from './getGuideSegment';
import { getGuideStyle } from './getGuideStyle';

export const drawGuides = (
  context: TDrawSceneContext,
  guideLines: TGuideLine[],
  nodesById: Record<string, TSceneNode>,
  refs: TCanvasRefs,
  areRulersVisible: boolean,
): void => {
  if (areRulersVisible) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const strokeWidth = 1 / viewport.zoom;
    const dragging = refs.guides.draggingGuideRef.current;
    const committedLines = dragging?.id ? guideLines.filter((guide) => guide.id !== dragging.id) : guideLines;
    const lines = dragging ? [...committedLines, getDraggingGuideLine(dragging, nodesById)] : guideLines;
    const activeId = dragging ? (dragging.id ?? '') : null;
    const hoveredId = refs.guides.hoveredGuideRef.current?.id ?? null;
    const selectedId = refs.guides.selectedGuideRef.current?.id ?? null;

    lines.forEach((guide) => {
      const segment = getGuideSegment(guide, canvasWidth, canvasHeight, viewport);
      const { alpha, color } = getGuideStyle(guide, guide.id === activeId, hoveredId, selectedId);

      drawLine(gl, program, buffer, segment, color, strokeWidth, canvasWidth, canvasHeight, viewport, alpha);
    });
  }
};
