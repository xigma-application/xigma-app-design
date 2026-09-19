// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../../../../AppearanceSection/types';
import { StrokeProfile } from 'types/design/enums';

// utils
import { STROKE_PROFILE_DEFAULT } from 'constant/strokeProfile';

export type TUseStrokeSettingsWidthProfileFieldResult = {
  flipped: boolean;
  onFlipToggle: TFunc;
  onProfileSelect: TFunc<[StrokeProfile]>;
  profile: StrokeProfile;
};

export const useStrokeSettingsWidthProfileField = (): TUseStrokeSettingsWidthProfileFieldResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const profile = node?.strokeProfile ?? STROKE_PROFILE_DEFAULT;
  const flipped = node?.strokeProfileFlipped ?? false;

  const commitWithHistory = (changes: Parameters<typeof updateNode>[0]['changes']): void => {
    if (node) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNode({ changes, id: node.id }));
      dispatch(endHistoryGesture());
    }
  };

  const onProfileSelect = (nextProfile: StrokeProfile): void => {
    if (nextProfile !== profile) {
      commitWithHistory({ strokeProfile: nextProfile });
    }
  };

  return {
    flipped,
    onFlipToggle: () => commitWithHistory({ strokeProfileFlipped: !flipped }),
    onProfileSelect,
    profile,
  };
};
