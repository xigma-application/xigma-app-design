// others
import { STROKE_JOIN_ICONS, STROKE_JOINS, TStrokeJoin } from '../constants';

// types
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const getStrokeJoinButtons = (getLabel: (join: TStrokeJoin) => string): TToggleButton[] =>
  STROKE_JOINS.map((join) => ({ ariaLabel: getLabel(join), icon: STROKE_JOIN_ICONS[join], tooltip: getLabel(join), value: join }));
