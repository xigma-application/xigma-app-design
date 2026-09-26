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
  const { node, vertexIds } = useSelectedVectorPoints();
  const radii = node ? getVectorCornerRadii(node, vertexIds) : [0];
  const [value] = radii;
  const isMixed = radii.some((radius) => radius !== value);

  const commit = (getValue: TFunc<[number], number>): void => {
    dispatch(updateNode({ changes: getVectorCornerRadiusChanges(node!, vertexIds, getValue), id: node!.id }));
  };

  const handleCommit = (raw: string): void => {
    const parsed = parseArcValue(raw);

    if (parsed !== null) {
      history.run(() => commit(() => parsed));
    }
  };

  return {
    iconName: vertexIds.length > 0 ? 'BorderRadiusT' : 'Corners',
    onCommit: handleCommit,
    onScrub: (next): void => commit((radius) => radius + next - value),
    value,
    valueLabel: isMixed ? MIXED_LABEL : value,
  };
};
