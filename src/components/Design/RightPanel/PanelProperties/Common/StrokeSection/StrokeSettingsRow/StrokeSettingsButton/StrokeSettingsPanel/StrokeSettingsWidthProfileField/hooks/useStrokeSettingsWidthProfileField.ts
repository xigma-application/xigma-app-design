// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectAppearanceNodes } from 'store/design/selectors';
import { updateNode, updateNodes } from 'store/design/slice';
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
  profile: StrokeProfile | undefined;
};

export const useStrokeSettingsWidthProfileField = (): TUseStrokeSettingsWidthProfileFieldResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isAppearanceNode);
  const profiles = nodes.map((node) => node.strokeProfile ?? STROKE_PROFILE_DEFAULT);
  const profile = profiles.every((nodeProfile) => nodeProfile === profiles[0]) ? (profiles[0] ?? STROKE_PROFILE_DEFAULT) : undefined;
  const flipped = nodes.length > 0 && nodes.every((node) => node.strokeProfileFlipped ?? false);

  const commitWithHistory = (changes: Parameters<typeof updateNode>[0]['changes']): void => {
    if (nodes.length > 0) {
      dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
      dispatch(updateNodes(nodes.map((node) => ({ changes, id: node.id }))));
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
