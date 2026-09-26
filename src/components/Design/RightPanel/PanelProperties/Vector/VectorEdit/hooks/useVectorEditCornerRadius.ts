// @xigma
import { TIconProps } from '@xigma/components';

// hooks
import { useSelectedVectorPoints } from './useSelectedVectorPoints';
import { useVectorPointsHistory } from './useVectorPointsHistory';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { updateNode } from 'store/design/slice';
import { useAppDispatch } from 'store';

// utils
import { getVectorCornerRadii } from 'utils/canvas/vectorNetwork/roundVectorCorners/getVectorCornerRadii';
import { getVectorCornerRadiusChanges } from '../utils/getVectorCornerRadiusChanges';
import { getVectorCornerRadiusTargets } from '../utils/getVectorCornerRadiusTargets';
import { parseArcValue } from '../../../Common/AppearanceSection/Arc/hooks/utils/parseArcValue';

export type TUseVectorEditCornerRadiusResult = {
  iconName: TIconProps['name'];
  onCommit: TFunc<[string]>;
  onScrub: TFunc<[number]>;
  value: number;
  valueLabel: number | string;
};

export const useVectorEditCornerRadius = (): TUseVectorEditCornerRadiusResult => {
  const dispatch = useAppDispatch();
  const history = useVectorPointsHistory();
  const targets = getVectorCornerRadiusTargets(useSelectedVectorPoints());
  const radii = targets.flatMap(({ node, pointIds }) => getVectorCornerRadii(node, pointIds));
  const value = radii[0] ?? 0;
  const isMixed = radii.some((radius) => radius !== value);

  const commit = (getValue: TFunc<[number], number>): void =>
    targets.forEach(({ node, pointIds }) => {
      dispatch(updateNode({ changes: getVectorCornerRadiusChanges(node, pointIds, getValue), id: node.id }));
    });

  const handleCommit = (raw: string): void => {
    const parsed = parseArcValue(raw);

    if (parsed !== null) {
      history.run(() => commit(() => parsed));
    }
  };

  return {
    iconName: targets.some(({ pointIds }) => pointIds.length > 0) ? 'BorderRadiusT' : 'Corners',
    onCommit: handleCommit,
    onScrub: (next): void => commit((radius) => radius + next - value),
    value,
    valueLabel: isMixed ? MIXED_LABEL : value,
  };
};
