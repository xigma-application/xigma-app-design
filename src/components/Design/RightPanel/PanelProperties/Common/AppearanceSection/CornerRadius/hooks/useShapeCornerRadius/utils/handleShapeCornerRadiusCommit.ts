// store
import { AppDispatch } from 'store';

// types
import { TShapeNode } from '../../../../../types';

// utils
import { commitShapeCornerRadius } from './commitShapeCornerRadius';
import { parseArcValue } from '../../../../Arc/hooks/utils/parseArcValue';

export const handleShapeCornerRadiusCommit = (dispatch: AppDispatch, nodes: TShapeNode[], raw: string): void => {
  const parsed = parseArcValue(raw);

  if (parsed !== null) {
    commitShapeCornerRadius(dispatch, nodes, () => parsed);
  }
};
