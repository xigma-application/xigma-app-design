// others
import { SECTION_NAME_LABEL_DARK_STYLE, SECTION_NAME_LABEL_LIGHT_STYLE } from './constants';
import { SECTION_NAME_LABEL_LIGHT_TEXT_FILL, VALUE_LABEL_TEXT_FILL } from 'constant/canvas';

// types
import { TSectionNameLabelStyle } from './types';
import { TSectionNode } from 'types/design/types';
import { TSolidPaint } from 'types/design/paint/types';

// utils
import { isLightColor } from 'utils/color/isLightColor';

const getSectionStrokePaint = (node: Pick<TSectionNode, 'strokeWidth' | 'strokes'>): TSolidPaint | undefined => {
  if (node.strokeWidth) {
    return node.strokes?.find((paint): paint is TSolidPaint => paint.visible !== false && paint.type === 'solid');
  }

  return undefined;
};

export const getSectionNameLabelStyle = (
  node: Pick<TSectionNode, 'fills' | 'strokeWidth' | 'strokes'>,
  backgroundColor: string,
): TSectionNameLabelStyle => {
  const visibleFills = node.fills.filter((paint) => paint.visible !== false);
  const [fill] = visibleFills;

  if (visibleFills.length === 1 && fill?.type === 'solid') {
    const stroke = getSectionStrokePaint(node);

    return {
      fill: fill.color,
      stroke: stroke?.color ?? null,
      strokeOpacity: (stroke?.opacity ?? 0) / 100,
      textFill: isLightColor(fill.color) ? SECTION_NAME_LABEL_LIGHT_TEXT_FILL : VALUE_LABEL_TEXT_FILL,
    };
  }

  return isLightColor(backgroundColor) ? SECTION_NAME_LABEL_LIGHT_STYLE : SECTION_NAME_LABEL_DARK_STYLE;
};
