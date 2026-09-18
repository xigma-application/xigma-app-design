// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { computeImageCropZoomRect } from './computeImageCropZoomRect';

export const commitImageCropZoom = (
  dispatch: AppDispatch,
  node: TAppearanceNode,
  paint: TImagePaint | TVideoPaint,
  paintIndex: number,
  targetPercent: number,
): void => {
  const crop = computeImageCropZoomRect(node, paint, targetPercent);

  if (crop) {
    const fills = node.fills.map((fill, index) => (index === paintIndex ? { ...paint, crop } : fill));

    dispatch(updateNode({ changes: { fills }, id: node.id }));
  }
};
