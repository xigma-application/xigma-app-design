import { useCallback } from 'react';

// store
import { useAppDispatch } from 'store';

// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { commitImageCropZoom } from '../utils/commitImageCropZoom';

export const useHandleZoomChange = (
  node: TAppearanceNode | undefined,
  paint: TImagePaint | undefined,
  paintIndex: number | undefined,
): TFunc<[number]> => {
  const dispatch = useAppDispatch();

  return useCallback(
    (percent: number): void => {
      if (node && paint && paintIndex !== undefined) {
        commitImageCropZoom(dispatch, node, paint, paintIndex, percent);
      }
    },
    [dispatch, node, paint, paintIndex],
  );
};
