// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { BlendMode } from 'types/design/enums';

export const commitBlendModeChange = (dispatch: AppDispatch, id: string, blendMode: BlendMode): void => {
  dispatch(updateNode({ changes: { blendMode }, id }));
};
