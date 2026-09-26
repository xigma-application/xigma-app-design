// hooks
import { useVectorPointGroups } from './useVectorPointGroups';
import { useVectorPointsHistory } from './useVectorPointsHistory';

// others
import { DISTRIBUTE_MENU_TRIGGER_ICON, DISTRIBUTE_MIN_CHILDREN, TIDY_UP_ICONS } from '../../../Common/PositionSection/ColumnAlignment/constants';

// store
import { useAppDispatch } from 'store';

// types
import { TArrangeAction } from '../../../Common/PositionSection/ColumnAlignment/types';
import { TUseDistributeMenuResult } from '../../../Common/PositionSection/ColumnAlignment/DistributeMenu/hooks/useDistributeMenu';

// utils
import { getDistributedVectorPointGroupDeltas } from '../utils/getDistributedVectorPointGroupDeltas';
import { getTidyUpKind } from '../../../Common/PositionSection/ColumnAlignment/hooks/utils/tidyUp/getTidyUpKind';
import { getTidyUpVectorPointGroupDeltas } from '../utils/getTidyUpVectorPointGroupDeltas';
import { isVectorPointGroupsTidyable } from '../utils/isVectorPointGroupsTidyable';
import { translateVectorPointGroups } from '../utils/translateVectorPointGroups';

export const useVectorEditDistributeMenu = (): TUseDistributeMenuResult => {
  const dispatch = useAppDispatch();
  const history = useVectorPointsHistory();
  const { groups, node } = useVectorPointGroups();
  const canDistribute = groups.length >= DISTRIBUTE_MIN_CHILDREN;
  const canTidyUp = isVectorPointGroupsTidyable(groups);
  const tidyUpKind = canTidyUp ? getTidyUpKind(groups.map(({ rect }) => rect)) : undefined;

  const handleAction = (action: TArrangeAction): void =>
    history.run(() =>
      translateVectorPointGroups(
        dispatch,
        node!,
        groups,
        action === 'tidyUp' ? getTidyUpVectorPointGroupDeltas(groups) : getDistributedVectorPointGroupDeltas(groups, action),
      ),
    );

  return {
    enabledActions: { horizontal: canDistribute, tidyUp: canTidyUp, vertical: canDistribute },
    onAction: handleAction,
    tidyUpIcon: tidyUpKind ? TIDY_UP_ICONS[tidyUpKind] : TIDY_UP_ICONS.column,
    triggerIcon: tidyUpKind ? TIDY_UP_ICONS[tidyUpKind] : DISTRIBUTE_MENU_TRIGGER_ICON,
  };
};
