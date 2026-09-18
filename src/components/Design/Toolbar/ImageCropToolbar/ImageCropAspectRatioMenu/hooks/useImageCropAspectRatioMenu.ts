// store
import { useAppSelector } from 'store';

// hooks
import { useHandleSelectAspectRatioPreset } from './useHandleSelectAspectRatioPreset';

// others
import { ASPECT_RATIO_PRESETS } from '../constants';

// types
import { TAspectRatioTarget } from '../types';

// utils
import { isAspectRatioPresetActive } from '../utils/isAspectRatioPresetActive';
import { selectImageCropTarget } from '../../utils/selectImageCropTarget';

export type TUseImageCropAspectRatioMenuResult = {
  isCustomActive: boolean;
  isPresetActive: TFunc<[TAspectRatioTarget], boolean>;
  onSelectPreset: TFunc<[TAspectRatioTarget]>;
};

export const useImageCropAspectRatioMenu = (): TUseImageCropAspectRatioMenuResult => {
  const target = useAppSelector(selectImageCropTarget);
  const onSelectPreset = useHandleSelectAspectRatioPreset(target?.node, target?.paint);

  const isPresetActive = (preset: TAspectRatioTarget): boolean =>
    target ? isAspectRatioPresetActive(target.node, target.paint, preset) : false;

  return {
    isCustomActive: Boolean(target) && !ASPECT_RATIO_PRESETS.some(isPresetActive),
    isPresetActive,
    onSelectPreset,
  };
};
