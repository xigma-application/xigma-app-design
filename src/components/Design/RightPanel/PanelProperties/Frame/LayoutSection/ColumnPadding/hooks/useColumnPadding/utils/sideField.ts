import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TIconProps } from 'shared';
import { TPaddingField, TPaddingSide } from '../types';
import { TRightPanelPaddingGuideState } from 'types/design/canvas/types';

// utils
import { buildPaddingHoverHandlers } from './buildPaddingHoverHandlers';
import { clamp } from './clamp';
import { commitPaddingChange } from './commitPaddingChange';

export const sideField = (
  dispatch: AppDispatch,
  id: string,
  labelKey: string,
  e2eValue: string,
  iconName: TIconProps['name'],
  key: TPaddingSide,
  value: number,
  paddingGuideRef: RefObject<TRightPanelPaddingGuideState | null>,
  side: TAutoLayoutPaddingSide,
): TPaddingField => {
  const { onHoverEnd, onHoverStart } = buildPaddingHoverHandlers(paddingGuideRef, id, [side]);

  return {
    e2eValue,
    iconName,
    labelKey,
    onCommit: (raw): void => {
      const parsed = parseInt(raw.replace(/[^\d]/g, ''));

      if (!Number.isNaN(parsed)) {
        commitPaddingChange(dispatch, id, { [key]: clamp(parsed) });
      }
    },
    onHoverEnd,
    onHoverStart,
    onScrub: (next): void => commitPaddingChange(dispatch, id, { [key]: clamp(next) }),
    scrubValue: value,
    value,
  };
};
