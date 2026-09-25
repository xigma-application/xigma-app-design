// others
import { OFFSET_VECTOR_JOIN_ICONS, OFFSET_VECTOR_JOINS } from '../constants';

// types
import { StrokeJoin } from 'types/design/enums';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const getOffsetVectorJoinButtons = (getLabel: TFunc<[StrokeJoin], string>): TToggleButton[] =>
  OFFSET_VECTOR_JOINS.map((join) => ({
    ariaLabel: getLabel(join),
    icon: OFFSET_VECTOR_JOIN_ICONS[join],
    tooltip: getLabel(join),
    value: join,
  }));
