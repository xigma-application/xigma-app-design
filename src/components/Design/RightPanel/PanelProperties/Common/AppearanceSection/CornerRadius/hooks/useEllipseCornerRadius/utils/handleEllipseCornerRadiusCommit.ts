// store
import { AppDispatch } from 'store';

// types
import { TEllipseNode } from 'types/design/types';

// utils
import { commitEllipseCornerRadius } from './commitEllipseCornerRadius';
import { parseArcValue } from '../../../../Arc/hooks/utils/parseArcValue';

export const handleEllipseCornerRadiusCommit = (dispatch: AppDispatch, nodes: TEllipseNode[], raw: string): void => {
  const parsed = parseArcValue(raw);

  if (parsed !== null) {
    commitEllipseCornerRadius(dispatch, nodes, () => parsed);
  }
};
