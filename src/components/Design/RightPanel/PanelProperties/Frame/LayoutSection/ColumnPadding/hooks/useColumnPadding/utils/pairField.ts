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
import { getPaddingPairValue } from '../../../utils/getPaddingPairValue';
import { parsePaddingPair } from '../../../utils/parsePaddingPair';

export const pairField = (
  dispatch: AppDispatch,
  targets: TPaddingTarget[],
  labelKey: string,
  e2eValue: string,
  iconName: TIconProps['name'],
  firstKey: TPaddingSide,
  secondKey: TPaddingSide,
  paddingGuideRef: RefObject<TRightPanelPaddingGuideState | null>,
  sides: TAutoLayoutPaddingSide[],
): TPaddingField => {
  const { onHoverEnd, onHoverStart } = buildPaddingHoverHandlers(paddingGuideRef, targets[0]?.id ?? '', sides);
  const firstValue = targets[0]?.values[firstKey] ?? 0;
  const pairValues = targets.map((target) => getPaddingPairValue(target.values[firstKey], target.values[secondKey]));
  const isMixed = pairValues.some((pairValue) => pairValue !== pairValues[0]);

  return {
    e2eValue,
    iconName,
    labelKey,
    onCommit: (raw): void =>
      commitPaddingToTargets(dispatch, targets, (target) => {
        const parsed = parsePaddingPair(raw, { first: target.values[firstKey], second: target.values[secondKey] });

        return { [firstKey]: clamp(parsed.first), [secondKey]: clamp(parsed.second) };
      }),
    onHoverEnd,
    onHoverStart,
    onScrub: (next): void =>
      commitPaddingToTargets(dispatch, targets, (target) => ({
        [firstKey]: clamp(target.values[firstKey] + next - firstValue),
        [secondKey]: clamp(target.values[secondKey] + next - firstValue),
      })),
    scrubValue: firstValue,
    value: isMixed ? MIXED_LABEL : (pairValues[0] ?? getPaddingPairValue(0, 0)),
  };
};
