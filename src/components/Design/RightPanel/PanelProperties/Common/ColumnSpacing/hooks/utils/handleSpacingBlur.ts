import { FocusEvent } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TSceneNode } from 'types/design/types';
import { TSpacingAxis } from '../../types';

// utils
import { commitSelectionSpacing } from './commitSelectionSpacing';
import { getSpacingBlurValue } from './getSpacingBlurValue';
import { getSpacingGroupIds } from './getSpacingGroupIds';

export const handleSpacingBlur =
  (dispatch: AppDispatch, items: TSceneNode[], axis: TSpacingAxis, displayValue: number | string) =>
  (event: FocusEvent<HTMLInputElement>): void => {
    const value = getSpacingBlurValue(event.target.value);

    if (value !== null && value !== displayValue) {
      commitSelectionSpacing(dispatch, getSpacingGroupIds(items, axis), axis, value);
    } else {
      event.target.value = `${displayValue}`;
    }
  };
