import { useCallback } from 'react';

// store
import { useAppDispatch } from 'store';

// types
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { commitImageCropZoom } from '../utils/commitImageCropZoom';

export const useHandleZoomChange = (
  node: TImageFrameNode | undefined,
  paint: TImagePaint | TVideoPaint | undefined,
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
