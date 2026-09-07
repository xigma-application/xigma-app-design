// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

export const CONSTRAIN_KEYS = ['bottom', 'centerHorizontal', 'centerVertical', 'left', 'right', 'top'] as const;

export const CONSTRAIN_MODIFICATORS: Record<(typeof CONSTRAIN_KEYS)[number], string> = {
  bottom: 'ConstrainsView__constrain--bottom',
  centerHorizontal: 'ConstrainsView__constrain--center-horizontal',
  centerVertical: 'ConstrainsView__constrain--center-vertical',
  left: 'ConstrainsView__constrain--left',
  right: 'ConstrainsView__constrain--right',
  top: 'ConstrainsView__constrain--top',
};

export const HORIZONTAL_MODIFICATORS: Record<AlignmentHorizontal, string> = {
  [AlignmentHorizontal.center]: 'ConstrainsView__horizontal--center',
  [AlignmentHorizontal.left]: 'ConstrainsView__horizontal--left',
  [AlignmentHorizontal.right]: 'ConstrainsView__horizontal--right',
};

export const VERTICAL_MODIFICATORS: Record<AlignmentVertical, string> = {
  [AlignmentVertical.bottom]: 'ConstrainsView__vertical--bottom',
  [AlignmentVertical.center]: 'ConstrainsView__vertical--center',
  [AlignmentVertical.top]: 'ConstrainsView__vertical--top',
};
