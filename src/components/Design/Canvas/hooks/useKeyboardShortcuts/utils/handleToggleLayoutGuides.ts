// store
import { toggleLayoutGuidesVisible } from 'store/design/slice';
import { AppDispatch } from 'store';

export const handleToggleLayoutGuides = (dispatch: AppDispatch): void => {
  dispatch(toggleLayoutGuidesVisible());
};
