import { useCallback } from 'react';

// store
import { useAppDispatch } from 'store';

// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TAspectRatioTarget } from '../types';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { commitAspectRatioPreset } from '../utils/commitAspectRatioPreset';

export const useHandleSelectAspectRatioPreset = (
  node: TAppearanceNode | undefined,
  paint: TImagePaint | TVideoPaint | undefined,
): TFunc<[TAspectRatioTarget]> => {
  const dispatch = useAppDispatch();

  return useCallback(
    (target: TAspectRatioTarget): void => {
      if (node && paint) {
        commitAspectRatioPreset(dispatch, node, paint, target);
      }
    },
    [dispatch, node, paint],
  );
};
