import { RefObject } from 'react';

// store
import { setActiveTool } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TSliceDraft } from '../../types';

export const discardSlice = (dispatch: AppDispatch, sliceRef: RefObject<TSliceDraft | null>): void => {
  sliceRef.current = null;
  dispatch(setActiveTool(ToolName.default));
};
