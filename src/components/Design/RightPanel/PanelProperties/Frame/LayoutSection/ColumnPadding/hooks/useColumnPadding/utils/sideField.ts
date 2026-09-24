import { RefObject } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { AppDispatch } from 'store';

// types
import { TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TIconProps } from 'shared';
import { TPaddingField, TPaddingSide, TPaddingTarget } from '../types';
import { TRightPanelPaddingGuideState } from 'types/design/canvas/types';

// utils
import { buildPaddingHoverHandlers } from './buildPaddingHoverHandlers';
import { clamp } from './clamp';
import { commitPaddingToTargets } from './commitPaddingToTargets';

export const sideField = (
  dispatch: AppDispatch,
  targets: TPaddingTarget[],
  labelKey: string,
  e2eValue: string,
  iconName: TIconProps['name'],
  key: TPaddingSide,
  paddingGuideRef: RefObject<TRightPanelPaddingGuideState | null>,
  side: TAutoLayoutPaddingSide,
): TPaddingField => {
  const { onHoverEnd, onHoverStart } = buildPaddingHoverHandlers(paddingGuideRef, targets[0]?.id ?? '', [side]);
  const value = targets[0]?.values[key] ?? 0;
  const isMixed = targets.some((target) => target.values[key] !== value);

  return {
    e2eValue,
    iconName,
    labelKey,
    onCommit: (raw): void => {
      const parsed = parseInt(raw.replace(/[^\d]/g, ''));

      if (!Number.isNaN(parsed)) {
        commitPaddingToTargets(dispatch, targets, () => ({ [key]: clamp(parsed) }));
      }
    },
    onHoverEnd,
    onHoverStart,
    onScrub: (next): void => commitPaddingToTargets(dispatch, targets, (target) => ({ [key]: clamp(target.values[key] + next - value) })),
    scrubValue: value,
    value: isMixed ? MIXED_LABEL : value,
  };
};
