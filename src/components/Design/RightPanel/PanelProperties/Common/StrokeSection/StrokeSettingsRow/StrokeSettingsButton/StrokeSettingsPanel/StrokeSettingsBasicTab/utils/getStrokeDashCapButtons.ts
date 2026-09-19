// others
import { STROKE_DASH_CAP_ICONS, STROKE_DASH_CAPS } from '../constants';

// types
import { StrokeDashCap } from 'types/design/enums';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const getStrokeDashCapButtons = (getLabel: (cap: StrokeDashCap) => string): TToggleButton[] =>
  STROKE_DASH_CAPS.map((cap) => ({ ariaLabel: getLabel(cap), icon: STROKE_DASH_CAP_ICONS[cap], tooltip: getLabel(cap), value: cap }));
