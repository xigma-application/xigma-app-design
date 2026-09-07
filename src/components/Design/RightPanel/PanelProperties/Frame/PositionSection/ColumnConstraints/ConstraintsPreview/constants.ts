// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

export const isHorizontalTickActive = (
  value: AlignmentHorizontal | undefined,
  side: AlignmentHorizontal.left | AlignmentHorizontal.right,
): boolean => (value ?? AlignmentHorizontal.left) === side;

export const isVerticalTickActive = (
  value: AlignmentVertical | undefined,
  side: AlignmentVertical.top | AlignmentVertical.bottom,
): boolean => (value ?? AlignmentVertical.top) === side;

export const HORIZONTAL_TICKS: { modifier: 'left' | 'right'; value: AlignmentHorizontal.left | AlignmentHorizontal.right }[] = [
  { modifier: 'left', value: AlignmentHorizontal.left },
  { modifier: 'right', value: AlignmentHorizontal.right },
];

export const VERTICAL_TICKS: { modifier: 'bottom' | 'top'; value: AlignmentVertical.bottom | AlignmentVertical.top }[] = [
  { modifier: 'top', value: AlignmentVertical.top },
  { modifier: 'bottom', value: AlignmentVertical.bottom },
];
