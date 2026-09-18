// types
import { TContrastUnsupportedReason } from 'shared/UITools/ColorPicker/Body/SolidPanel/ContrastChecker/types';
import { TPaint } from 'types/design/paint/types';
import { TSceneNode } from 'types/design/types';

// utils
import { isBlendModeActive } from 'utils/design/paint/isBlendModeActive';

export const getContrastUnsupportedReason = (paint: TPaint, node: TSceneNode | undefined): TContrastUnsupportedReason | undefined => {
  const nodeBlendMode = node && 'blendMode' in node ? node.blendMode : undefined;

  return isBlendModeActive(paint.blendMode) || isBlendModeActive(nodeBlendMode) ? 'foreground' : undefined;
};
