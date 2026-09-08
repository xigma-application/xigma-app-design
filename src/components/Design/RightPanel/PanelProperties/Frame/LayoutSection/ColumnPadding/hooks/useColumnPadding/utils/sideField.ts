// store
import { AppDispatch } from 'store';

// types
import { TIconProps } from 'shared';
import { TPaddingField, TPaddingSide } from '../types';

// utils
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
): TPaddingField => ({
  e2eValue,
  iconName,
  labelKey,
  onCommit: (raw): void => {
    const parsed = parseInt(raw.replace(/[^\d]/g, ''));

    if (!Number.isNaN(parsed)) {
      commitPaddingChange(dispatch, id, { [key]: clamp(parsed) });
    }
  },
  onScrub: (next): void => commitPaddingChange(dispatch, id, { [key]: clamp(next) }),
  scrubValue: value,
  value,
});
