import { RefObject } from 'react';

// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TRightPanelPaddingGuideState } from 'types/design/canvas/types';

export type TPaddingHoverHandlers = {
  onHoverEnd: () => void;
  onHoverStart: () => void;
};

export const buildPaddingHoverHandlers = (
  paddingGuideRef: RefObject<TRightPanelPaddingGuideState | null>,
  frameId: string,
  sides: TAutoLayoutPaddingSide[],
): TPaddingHoverHandlers => ({
  onHoverEnd: (): void => {
    paddingGuideRef.current = null;
  },
  onHoverStart: (): void => {
    paddingGuideRef.current = { frameId, sides };
  },
});
