// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

export const commitGridSpanReset = (dispatch: AppDispatch, spanReset: string[]): void => {
  spanReset.forEach((id) => {
    dispatch(updateNode({ changes: { gridColumnSpan: undefined, gridRowSpan: undefined }, id }));
  });
};
