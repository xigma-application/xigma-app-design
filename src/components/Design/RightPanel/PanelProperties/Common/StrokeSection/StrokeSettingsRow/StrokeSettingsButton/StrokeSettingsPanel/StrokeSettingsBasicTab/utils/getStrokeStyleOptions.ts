// others
import { STROKE_STYLE_ICON_SIZE, STROKE_STYLE_ICONS, STROKE_STYLES } from '../constants';

// types
import { StrokeStyle } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getStrokeStyleOptions = (getLabel: (style: StrokeStyle) => string): TDropdownOption<StrokeStyle>[] =>
  STROKE_STYLES.map((style) => ({
    icon: STROKE_STYLE_ICONS[style],
    iconSize: STROKE_STYLE_ICON_SIZE,
    label: getLabel(style),
    separatorBefore: style === StrokeStyle.custom,
    value: style,
  }));
