// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TAspectRatioTarget } from '../types';
import { TImagePaint } from 'types/design/paint/types';

// utils
import { getAspectRatioPresetRect } from './getAspectRatioPresetRect';
import { getMaxCornerRadius } from 'utils/canvas/cornerRadius/getMaxCornerRadius';

export const commitAspectRatioPreset = (
  dispatch: AppDispatch,
  node: TAppearanceNode,
  paint: TImagePaint,
  target: TAspectRatioTarget,
): void => {
  const rect = getAspectRatioPresetRect(node, paint, target);

  if (rect) {
    const wantsMaxCornerRadius = typeof target === 'object' && target.cornerRadius === 'max';
    const cornerRadius = wantsMaxCornerRadius ? getMaxCornerRadius(rect) : 0;

    dispatch(updateNode({ changes: { cornerRadius, height: rect.height, width: rect.width, x: rect.x, y: rect.y }, id: node.id }));
  }
};
