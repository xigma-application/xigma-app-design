// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';
import { TUseEllipseCornerRadiusResult } from './types';

// utils
import { commitEllipseCornerRadius } from './utils/commitEllipseCornerRadius';
import { parseArcValue } from '../../../Arc/hooks/utils/parseArcValue';

export const useEllipseCornerRadius = (): TUseEllipseCornerRadiusResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter((node): node is TEllipseNode => node?.type === NodeType.ellipse);
  const value = nodes[0]?.cornerRadius ?? 0;
  const isMixed = nodes.some((node) => (node.cornerRadius ?? 0) !== value);

  return {
    onCommit: (raw): void => {
      const parsed = parseArcValue(raw);

      if (parsed !== null) {
        commitEllipseCornerRadius(dispatch, nodes, () => parsed);
      }
    },
    onScrub: (next): void => commitEllipseCornerRadius(dispatch, nodes, (node) => (node.cornerRadius ?? 0) + next - value),
    value,
    valueLabel: isMixed ? MIXED_LABEL : value,
  };
};
