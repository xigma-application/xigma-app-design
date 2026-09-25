// others
import { SECTION_CORNER_RADIUS, SECTION_STROKE, SECTION_STROKE_OPACITY, SECTION_STROKE_WIDTH_PX } from 'constant/canvas';
import { SECTION_FILL } from 'components/Design/Canvas/constants';

// types
import { StrokeAlign } from 'types/design/enums';
import { TSectionNode } from 'types/design/types';

// utils
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const getDefaultSectionStyle = (
  fill = SECTION_FILL,
): Pick<TSectionNode, 'cornerRadius' | 'fills' | 'strokeAlign' | 'strokeWidth' | 'strokes'> => ({
  cornerRadius: SECTION_CORNER_RADIUS,
  fills: [makeSolidPaint(fill)],
  strokeAlign: StrokeAlign.inside,
  strokeWidth: SECTION_STROKE_WIDTH_PX,
  strokes: [makeSolidPaint(SECTION_STROKE, SECTION_STROKE_OPACITY)],
});
