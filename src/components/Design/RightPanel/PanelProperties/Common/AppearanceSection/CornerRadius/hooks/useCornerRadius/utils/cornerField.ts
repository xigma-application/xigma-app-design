// store
import { AppDispatch } from 'store';

// types
import { TCornerRadiusField, TCornerRadiusKey } from '../types';
import { TIconProps } from 'shared';

// utils
import { clamp } from './clamp';
import { commitCornerRadiusChange } from './commitCornerRadiusChange';

export const cornerField = (
  dispatch: AppDispatch,
  id: string,
  key: TCornerRadiusKey,
  ariaLabel: string,
  e2eValue: string,
  iconName: TIconProps['name'],
  tooltip: string,
  value: number,
): TCornerRadiusField => ({
  ariaLabel,
  e2eValue,
  iconName,
  onCommit: (raw): void => {
    const parsed = parseInt(raw.replace(/[^\d]/g, ''), 10);

    if (!Number.isNaN(parsed)) {
      commitCornerRadiusChange(dispatch, id, { [key]: clamp(parsed) });
    }
  },
  onScrub: (next): void => commitCornerRadiusChange(dispatch, id, { [key]: clamp(next) }),
  tooltip,
  value,
});
