// types
import { GapMode, LayoutMode } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutEffectiveGaps } from 'store/design/utils/autoLayout/getAutoLayoutGapHandles/getAutoLayoutEffectiveGaps';

export type TFrameGapState = { mode: GapMode; value: number };

export const getFrameGapState = (frame: TFrameNode, nodes: Record<string, TSceneNode>, axis: 'horizontal' | 'vertical'): TFrameGapState => {
  const mode = (axis === 'horizontal' ? frame.horizontalGapMode : frame.verticalGapMode) ?? GapMode.fixed;
  const rawHorizontal = frame.horizontalGap ?? 0;
  const raw =
    axis === 'horizontal' ? rawHorizontal : (frame.verticalGap ?? (frame.layoutMode === LayoutMode.horizontal ? rawHorizontal : 0));

  if (mode === GapMode.auto) {
    const children = frame.childIds.map((childId) => nodes[childId]).filter(Boolean);

    return { mode, value: getAutoLayoutEffectiveGaps(frame, children)[axis] };
  }

  return { mode, value: raw };
};
