// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { useAppDispatch } from 'store';

// types
import { TFramePreset } from '../../../types';

// utils
import { handleCreateFramePreset } from '../utils/handleCreateFramePreset';

export const useCreateFramePreset = (): TFunc<[TFramePreset]> => {
  const dispatch = useAppDispatch();
  const refs = useCanvasRefsContext();

  return (preset: TFramePreset): void => handleCreateFramePreset(dispatch, refs, preset);
};
