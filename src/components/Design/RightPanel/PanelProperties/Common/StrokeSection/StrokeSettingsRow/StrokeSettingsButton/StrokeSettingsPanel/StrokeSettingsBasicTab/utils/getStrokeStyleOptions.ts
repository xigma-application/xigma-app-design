// others
import { STROKE_STYLE_ICON_SIZE, STROKE_STYLE_ICONS, STROKE_STYLES, TStrokeStyle } from '../constants';

// types
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getStrokeStyleOptions = (getLabel: (style: TStrokeStyle) => string): TDropdownOption<TStrokeStyle>[] =>
  STROKE_STYLES.map((style) => ({
    icon: STROKE_STYLE_ICONS[style],
    iconSize: STROKE_STYLE_ICON_SIZE,
    label: getLabel(style),
    separatorBefore: style === 'custom',
    value: style,
  }));
