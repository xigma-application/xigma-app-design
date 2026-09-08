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
import { getPaddingPairValue } from '../../../utils/getPaddingPairValue';
import { parsePaddingPair } from '../../../utils/parsePaddingPair';

export const pairField = (
  dispatch: AppDispatch,
  id: string,
  labelKey: string,
  e2eValue: string,
  iconName: TIconProps['name'],
  firstKey: TPaddingSide,
  firstValue: number,
  secondKey: TPaddingSide,
  secondValue: number,
  paddingGuideRef: RefObject<TRightPanelPaddingGuideState | null>,
  sides: TAutoLayoutPaddingSide[],
): TPaddingField => {
  const { onHoverEnd, onHoverStart } = buildPaddingHoverHandlers(paddingGuideRef, id, sides);

  return {
    e2eValue,
    iconName,
    labelKey,
    onCommit: (raw): void => {
      const parsed = parsePaddingPair(raw, { first: firstValue, second: secondValue });
      commitPaddingChange(dispatch, id, { [firstKey]: clamp(parsed.first), [secondKey]: clamp(parsed.second) });
    },
    onHoverEnd,
    onHoverStart,
    onScrub: (next): void => {
      const delta = next - firstValue;

      commitPaddingChange(dispatch, id, { [firstKey]: clamp(next), [secondKey]: clamp(secondValue + delta) });
    },
    scrubValue: firstValue,
    value: getPaddingPairValue(firstValue, secondValue),
  };
};
