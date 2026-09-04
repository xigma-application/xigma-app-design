// types
import { AlignmentLayout } from 'types/design/enums';
import { CrossAxisAlignment } from './types';

export const VERTICAL_CROSS_AXIS_ALIGNMENT: Record<AlignmentLayout, CrossAxisAlignment> = {
  [AlignmentLayout.bottomCenter]: CrossAxisAlignment.center,
  [AlignmentLayout.bottomLeft]: CrossAxisAlignment.start,
  [AlignmentLayout.bottomRight]: CrossAxisAlignment.end,
  [AlignmentLayout.center]: CrossAxisAlignment.center,
  [AlignmentLayout.left]: CrossAxisAlignment.start,
  [AlignmentLayout.right]: CrossAxisAlignment.end,
  [AlignmentLayout.topCenter]: CrossAxisAlignment.center,
  [AlignmentLayout.topLeft]: CrossAxisAlignment.start,
  [AlignmentLayout.topRight]: CrossAxisAlignment.end,
};

export const HORIZONTAL_CROSS_AXIS_ALIGNMENT: Record<AlignmentLayout, CrossAxisAlignment> = {
  [AlignmentLayout.bottomCenter]: CrossAxisAlignment.end,
  [AlignmentLayout.bottomLeft]: CrossAxisAlignment.end,
  [AlignmentLayout.bottomRight]: CrossAxisAlignment.end,
  [AlignmentLayout.center]: CrossAxisAlignment.center,
  [AlignmentLayout.left]: CrossAxisAlignment.center,
  [AlignmentLayout.right]: CrossAxisAlignment.center,
  [AlignmentLayout.topCenter]: CrossAxisAlignment.start,
  [AlignmentLayout.topLeft]: CrossAxisAlignment.start,
  [AlignmentLayout.topRight]: CrossAxisAlignment.start,
};
