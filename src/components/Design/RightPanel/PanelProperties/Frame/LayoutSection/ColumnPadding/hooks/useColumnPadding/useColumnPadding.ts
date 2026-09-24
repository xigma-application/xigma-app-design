import { useState } from 'react';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TPaddingTarget, TUseColumnPaddingResult } from './types';

// utils
import { isManagedLayoutFrame } from 'utils/canvas/signals/isManagedLayoutFrame';
import { pairField } from './utils/pairField';
import { sideField } from './utils/sideField';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

export const useColumnPadding = (): TUseColumnPaddingResult => {
  const dispatch = useAppDispatch();
  const { hover } = useCanvasRefsContext();
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const [individualOverride, setIndividualOverride] = useState<boolean | null>(null);
  const frames = selectedNodes.filter(isManagedLayoutFrame);
  const targets: TPaddingTarget[] = frames.map((frame) => ({
    id: frame.id,
    values: {
      paddingBottom: frame.paddingBottom ?? 0,
      paddingLeft: frame.paddingLeft ?? 0,
      paddingRight: frame.paddingRight ?? 0,
      paddingTop: frame.paddingTop ?? 0,
    },
  }));
  const guideRef = hover.rightPanelPaddingGuideRef;
  const hasUnevenPadding =
    targets.length > 1 &&
    targets.some(({ values }) => values.paddingLeft !== values.paddingRight || values.paddingTop !== values.paddingBottom);
  const isIndividual = individualOverride ?? hasUnevenPadding;

  return {
    individualFields: [
      sideField(dispatch, targets, 'left', 'padding-left', 'PaddingL', 'paddingLeft', guideRef, 'left'),
      sideField(dispatch, targets, 'top', 'padding-top', 'PaddingT', 'paddingTop', guideRef, 'top'),
      sideField(dispatch, targets, 'right', 'padding-right', 'PaddingR', 'paddingRight', guideRef, 'right'),
      sideField(dispatch, targets, 'bottom', 'padding-bottom', 'PaddingB', 'paddingBottom', guideRef, 'bottom'),
    ],
    isIndividual,
    isVisible: isManagedLayoutFrame(selectedNodes[0]),
    mergedFields: [
      pairField(dispatch, targets, 'horizontal', 'padding-horizontal', 'PaddingLR', 'paddingLeft', 'paddingRight', guideRef, [
        'left',
        'right',
      ]),
      pairField(dispatch, targets, 'vertical', 'padding-vertical', 'PaddingTB', 'paddingTop', 'paddingBottom', guideRef, ['top', 'bottom']),
    ],
    toggleIndividual: () => setIndividualOverride(!isIndividual),
  };
};
