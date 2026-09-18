import { createSelector } from '@reduxjs/toolkit';

// store
import { selectImageEditor, selectNodes } from 'store/design/selectors';

// types
import { TImageCrop, TImagePaint, TPaintProperty, TVideoPaint } from 'types/design/paint/types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { isAppearanceNode, TAppearanceNode } from '../AppearanceSection/types';

export type TSelectedImageCrop = {
  crop: TImageCrop;
  node: TAppearanceNode;
  paint: TImagePaint | TVideoPaint;
  paintIndex: number;
  property?: TPaintProperty;
};

export const selectSelectedImageCrop = createSelector(
  [selectImageEditor, selectNodes],
  (imageEditor, nodes): TSelectedImageCrop | undefined => {
    if (imageEditor?.selectedTarget === 'image') {
      const node = nodes[imageEditor.nodeId];

      if (isAppearanceNode(node)) {
        const paint = getNodePaints(node, imageEditor.property)[imageEditor.paintIndex];

        if (paint?.type === 'image' || paint?.type === 'video') {
          return { crop: getImageCropRect(node, paint), node, paint, paintIndex: imageEditor.paintIndex, property: imageEditor.property };
        }
      }
    }

    return undefined;
  },
);
