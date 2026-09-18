import { useCallback } from 'react';

// store
import { selectImageCropTarget } from '../utils/selectImageCropTarget';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { commitFitNodeToImage } from '../utils/commitFitNodeToImage';

export const useHandleFitClick = (): TFunc => {
  const dispatch = useAppDispatch();
  const target = useAppSelector(selectImageCropTarget);

  return useCallback((): void => {
    if (target) {
      commitFitNodeToImage(dispatch, target.node, target.paint);
    }
  }, [dispatch, target]);
};
