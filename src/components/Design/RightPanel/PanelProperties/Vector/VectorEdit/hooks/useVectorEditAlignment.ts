// hooks
import { useVectorPointGroups } from './useVectorPointGroups';
import { useVectorPointsHistory } from './useVectorPointsHistory';

// store
import { useAppDispatch } from 'store';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

// utils
import { getAlignedVectorPointGroupDeltas } from '../utils/getAlignedVectorPointGroupDeltas';
import { translateVectorPointGroups } from '../utils/translateVectorPointGroups';

export type TUseVectorEditAlignmentResult = {
  disabled: boolean;
  onSelectHorizontal: TFunc<[AlignmentHorizontal]>;
  onSelectVertical: TFunc<[AlignmentVertical]>;
};

export const useVectorEditAlignment = (): TUseVectorEditAlignmentResult => {
  const dispatch = useAppDispatch();
  const history = useVectorPointsHistory();
  const { groups, node } = useVectorPointGroups();

  const align = (horizontal: AlignmentHorizontal | undefined, vertical: AlignmentVertical | undefined): void =>
    history.run(() => translateVectorPointGroups(dispatch, node!, groups, getAlignedVectorPointGroupDeltas(groups, horizontal, vertical)));

  return {
    disabled: groups.length < 2,
    onSelectHorizontal: (horizontal): void => align(horizontal, undefined),
    onSelectVertical: (vertical): void => align(undefined, vertical),
  };
};
