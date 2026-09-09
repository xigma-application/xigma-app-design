// types
import { AlignmentLayout } from 'types/design/enums';

const MAIN_AXIS_ALIGNMENT: Record<AlignmentLayout, AlignmentLayout> = {
  [AlignmentLayout.bottomCenter]: AlignmentLayout.center,
  [AlignmentLayout.bottomLeft]: AlignmentLayout.left,
  [AlignmentLayout.bottomRight]: AlignmentLayout.right,
  [AlignmentLayout.center]: AlignmentLayout.center,
  [AlignmentLayout.left]: AlignmentLayout.left,
  [AlignmentLayout.right]: AlignmentLayout.right,
  [AlignmentLayout.topCenter]: AlignmentLayout.center,
  [AlignmentLayout.topLeft]: AlignmentLayout.left,
  [AlignmentLayout.topRight]: AlignmentLayout.right,
};

export const isBaselineOptionSelected = (alignment: AlignmentLayout, value: AlignmentLayout, isLocked = false): boolean =>
  isLocked || MAIN_AXIS_ALIGNMENT[value] === alignment;
