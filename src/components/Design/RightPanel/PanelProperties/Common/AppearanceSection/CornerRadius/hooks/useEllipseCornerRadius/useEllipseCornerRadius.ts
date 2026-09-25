// others
import { ELLIPSE_DEFAULT_ARC_ANGLE } from 'constant/canvas';
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';
import { TUseEllipseCornerRadiusResult } from './types';

// utils
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';
import { commitEllipseCornerRadius } from './utils/commitEllipseCornerRadius';
import { handleEllipseCornerRadiusCommit } from './utils/handleEllipseCornerRadiusCommit';

export const useEllipseCornerRadius = (): TUseEllipseCornerRadiusResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TEllipseNode => node?.type === NodeType.ellipse);
  const value = nodes[0]?.cornerRadius ?? 0;
  const isMixed = nodes.some((node) => (node.cornerRadius ?? 0) !== value);
  const isDisabled = !nodes.some((node) =>
    hasEllipseArc(node.arcStartAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE, node.arcEndAngle ?? ELLIPSE_DEFAULT_ARC_ANGLE),
  );

  return {
    isDisabled,
    onCommit: (raw): void => handleEllipseCornerRadiusCommit(dispatch, nodes, raw),
    onScrub: (next): void => commitEllipseCornerRadius(dispatch, nodes, (node) => (node.cornerRadius ?? 0) + next - value),
    value,
    valueLabel: isMixed ? MIXED_LABEL : value,
  };
};
