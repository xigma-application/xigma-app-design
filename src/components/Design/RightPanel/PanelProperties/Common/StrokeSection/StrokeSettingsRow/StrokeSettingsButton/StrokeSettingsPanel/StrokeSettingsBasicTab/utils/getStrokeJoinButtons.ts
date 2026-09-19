// others
import { STROKE_JOIN_ICONS, STROKE_JOINS } from '../constants';

// types
import { StrokeJoin } from 'types/design/enums';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const getStrokeJoinButtons = (getLabel: (join: StrokeJoin) => string): TToggleButton[] =>
  STROKE_JOINS.map((join) => ({ ariaLabel: getLabel(join), icon: STROKE_JOIN_ICONS[join], tooltip: getLabel(join), value: join }));
