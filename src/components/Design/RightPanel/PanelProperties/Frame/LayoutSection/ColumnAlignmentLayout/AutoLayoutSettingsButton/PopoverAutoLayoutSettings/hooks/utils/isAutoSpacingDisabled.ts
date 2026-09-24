// types
import { GapMode, LayoutMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

export const isAutoSpacingDisabled = (frames: TFrameNode[]): boolean =>
  frames.length === 0 ||
  frames.some((frame) => (frame.layoutMode === LayoutMode.horizontal ? frame.horizontalGapMode : frame.verticalGapMode) !== GapMode.auto);
