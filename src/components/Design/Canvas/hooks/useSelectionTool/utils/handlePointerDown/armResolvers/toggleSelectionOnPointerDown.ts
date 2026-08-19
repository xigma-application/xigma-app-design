// store
import { setSelection } from 'store/design/slice';

// types
import { TArmContext } from '../types';

// utils
import { toggleSelection } from '../../toggleSelection';

export const toggleSelectionOnPointerDown = ({ currentSelection, dispatch, event, hit }: TArmContext): true | undefined => {
  if (hit && event.shiftKey) {
    dispatch(setSelection(toggleSelection(currentSelection, hit.id)));

    return true;
  }
};
