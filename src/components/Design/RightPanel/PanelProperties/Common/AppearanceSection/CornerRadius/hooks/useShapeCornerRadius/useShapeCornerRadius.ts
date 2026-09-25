// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TShapeNode, TShapeNodeType } from '../../../../types';
import { TUseShapeCornerRadiusResult } from './types';

// utils
import { commitShapeCornerRadius } from './utils/commitShapeCornerRadius';
import { handleShapeCornerRadiusCommit } from './utils/handleShapeCornerRadiusCommit';
import { hasShapeCorners } from './utils/hasShapeCorners';

export const useShapeCornerRadius = (type: TShapeNodeType): TUseShapeCornerRadiusResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TShapeNode => node?.type === type);
  const value = nodes[0]?.cornerRadius ?? 0;
  const isMixed = nodes.some((node) => (node.cornerRadius ?? 0) !== value);

  return {
    isDisabled: !nodes.some(hasShapeCorners),
    onCommit: (raw): void => handleShapeCornerRadiusCommit(dispatch, nodes, raw),
    onScrub: (next): void => commitShapeCornerRadius(dispatch, nodes, (node) => (node.cornerRadius ?? 0) + next - value),
    value,
    valueLabel: isMixed ? MIXED_LABEL : value,
  };
};
