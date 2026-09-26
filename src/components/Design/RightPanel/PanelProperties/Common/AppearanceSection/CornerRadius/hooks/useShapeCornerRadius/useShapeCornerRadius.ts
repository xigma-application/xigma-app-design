// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TShapeOrVectorNode, TShapeOrVectorNodeType } from '../../../../types';
import { TUseShapeCornerRadiusResult } from './types';

// utils
import { commitShapeCornerRadius } from './utils/commitShapeCornerRadius';
import { getShapeCornerRadii } from './utils/getShapeCornerRadii';
import { handleShapeCornerRadiusCommit } from './utils/handleShapeCornerRadiusCommit';
import { hasShapeCorners } from './utils/hasShapeCorners';

export const useShapeCornerRadius = (type: TShapeOrVectorNodeType): TUseShapeCornerRadiusResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TShapeOrVectorNode => node?.type === type);
  const radii = nodes.flatMap(getShapeCornerRadii);
  const value = radii[0] ?? 0;
  const isMixed = radii.some((radius) => radius !== value);

  return {
    isDisabled: !nodes.some(hasShapeCorners),
    onCommit: (raw): void => handleShapeCornerRadiusCommit(dispatch, nodes, raw),
    onScrub: (next): void => commitShapeCornerRadius(dispatch, nodes, (node) => (node.cornerRadius ?? 0) + next - value),
    value,
    valueLabel: isMixed ? MIXED_LABEL : value,
  };
};
