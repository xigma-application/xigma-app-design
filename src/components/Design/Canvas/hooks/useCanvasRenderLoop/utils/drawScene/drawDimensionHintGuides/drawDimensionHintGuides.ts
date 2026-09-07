// others
import {
  DIMENSION_HINT_GUIDE_BLUE,
  DIMENSION_HINT_GUIDE_RED,
  DISTANCE_GUIDE_DASH_GAP_PX,
  DISTANCE_GUIDE_DASH_LENGTH_PX,
  DISTANCE_GUIDE_LABEL_GAP_PX,
} from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDimensionHintColor } from 'components/Design/Canvas/utils/getDimensionHintGuides/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawDashedLine } from 'utils/canvas/drawDashedLine';
import { drawDimensionHintArrowhead } from './drawDimensionHintArrowhead';
import { drawLine } from 'utils/canvas/drawLine';
import { drawValueLabel } from 'utils/canvas/text/drawValueLabel/drawValueLabel';

const toHex = (color: TDimensionHintColor): string => (color === 'red' ? DIMENSION_HINT_GUIDE_RED : DIMENSION_HINT_GUIDE_BLUE);

export const drawDimensionHintGuides = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const guides = refs.transform.dimensionHintGuidesRef.current;

  if (guides) {
    const strokeWidth = 1 / viewport.zoom;

    guides.lines.forEach((line) => {
      const color = toHex(line.color);

      if (line.dashed) {
        drawDashedLine(
          gl,
          program,
          buffer,
          line,
          color,
          strokeWidth,
          canvasWidth,
          canvasHeight,
          viewport,
          DISTANCE_GUIDE_DASH_LENGTH_PX,
          DISTANCE_GUIDE_DASH_GAP_PX,
        );
      } else {
        drawLine(gl, program, buffer, line, color, strokeWidth, canvasWidth, canvasHeight, viewport);
      }

      if (line.arrowAtEnd) {
        drawDimensionHintArrowhead(
          gl,
          program,
          buffer,
          { x: line.x2, y: line.y2 },
          { x: line.x1, y: line.y1 },
          color,
          strokeWidth,
          canvasWidth,
          canvasHeight,
          viewport,
        );
      }
    });

    guides.labels.forEach((label) =>
      drawValueLabel(
        gl,
        program,
        buffer,
        imageContext,
        label.text,
        label.anchor,
        label.offsetDirection,
        canvasWidth,
        canvasHeight,
        viewport,
        { edgeGapPx: DISTANCE_GUIDE_LABEL_GAP_PX, fill: toHex(label.color) },
      ),
    );
  }
};
