// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

// utils
import { deleteFlattenedTextPaths } from './flattenSelection/deleteFlattenedTextPaths';
import { flattenEntries } from './flattenSelection/flattenEntries';
import { getFlattenEntries } from './flattenSelection/getFlattenEntries';
import { getFlattenEntryGroups } from './flattenSelection/getFlattenEntryGroups';
import { getTextFlattenTargets } from './getTextFlattenTargets';

export const handleFlattenSelection = async (dispatch: AppDispatch): Promise<void> => {
  const entries = getFlattenEntries(await getTextFlattenTargets());

  if (entries.length > 0) {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    getFlattenEntryGroups(entries).forEach((group) => flattenEntries(dispatch, group));
    deleteFlattenedTextPaths(dispatch, entries);
    dispatch(endHistoryGesture());
  }
};
