// store
import { selectOffsetVector } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { commitOffsetVector } from 'components/Design/Toolbar/OffsetVectorToolbar/utils/commitOffsetVector';
import { handleEnterVectorEdit } from './handleEnterVectorEdit/handleEnterVectorEdit';

export const handleEnter = (dispatch: AppDispatch, refs: TCanvasRefs): void => {
  if (selectOffsetVector(store.getState())) {
    commitOffsetVector(dispatch);
  } else {
    handleEnterVectorEdit(dispatch, refs);
  }
};
