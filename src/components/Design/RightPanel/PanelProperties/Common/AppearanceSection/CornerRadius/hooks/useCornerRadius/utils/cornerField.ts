// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { AppDispatch } from 'store';

// types
import { TAppearanceNode } from '../../../../types';
import { TCornerRadiusField, TCornerRadiusKey } from '../types';
import { TIconProps } from 'shared';

// utils
import { clamp } from './clamp';
import { commitCornerRadiusChange } from './commitCornerRadiusChange';
import { commitOnNodes } from '../../../../utils/commitOnNodes';
import { getNodeCornerRadii } from './getNodeCornerRadii';

export const cornerField = (
  dispatch: AppDispatch,
  nodes: TAppearanceNode[],
  key: TCornerRadiusKey,
  ariaLabel: string,
  e2eValue: string,
  iconName: TIconProps['name'],
  tooltip: string,
): TCornerRadiusField => {
  const value = getNodeCornerRadii(nodes[0])[key];
  const isMixed = nodes.some((node) => getNodeCornerRadii(node)[key] !== value);

  return {
    ariaLabel,
    e2eValue,
    iconName,
    onCommit: (raw): void => {
      const parsed = parseInt(raw.replace(/[^\d]/g, ''), 10);

      if (!Number.isNaN(parsed)) {
        commitOnNodes(dispatch, nodes, (node) => commitCornerRadiusChange(dispatch, node.id, { [key]: clamp(parsed) }));
      }
    },
    onScrub: (next): void =>
      commitOnNodes(dispatch, nodes, (node) =>
        commitCornerRadiusChange(dispatch, node.id, { [key]: clamp(getNodeCornerRadii(node)[key] + next - value) }),
      ),
    scrubValue: value,
    tooltip,
    value: isMixed ? MIXED_LABEL : value,
  };
};
