// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TAppearanceNode } from '../../../../types';

export type TCornerRadiusChanges = Partial<
  Pick<
    TAppearanceNode,
    'cornerRadius' | 'cornerRadiusBottomLeft' | 'cornerRadiusBottomRight' | 'cornerRadiusTopLeft' | 'cornerRadiusTopRight'
  >
>;

export const commitCornerRadiusChange = (dispatch: AppDispatch, id: string, changes: TCornerRadiusChanges): void => {
  dispatch(updateNode({ changes, id }));
};
