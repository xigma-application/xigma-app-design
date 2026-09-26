import { createSelector } from '@reduxjs/toolkit';

// store
import { selectImageEditor, selectNodes } from 'store/design/selectors';

// types
import { TImageCrop, TImagePaint, TPaintProperty, TVideoPaint } from 'types/design/paint/types';
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

// utils
import { getImageCropRect } from 'components/Design/Canvas/utils/getImageCropRect';
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { isImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/utils/isImageFrameNode';

export type TSelectedImageCrop = {
  crop: TImageCrop;
  node: TImageFrameNode;
  paint: TImagePaint | TVideoPaint;
  paintIndex: number;
  property?: TPaintProperty;
};

export const selectSelectedImageCrop = createSelector(
  [selectImageEditor, selectNodes],
  (imageEditor, nodes): TSelectedImageCrop | undefined => {
    if (imageEditor?.selectedTarget === 'image') {
      const node = nodes[imageEditor.nodeId];

      if (isImageFrameNode(node)) {
        const paint = getNodePaints(node, imageEditor.property)[imageEditor.paintIndex];

        if (paint?.type === 'image' || paint?.type === 'video') {
          return { crop: getImageCropRect(node, paint), node, paint, paintIndex: imageEditor.paintIndex, property: imageEditor.property };
        }
      }
    }

    return undefined;
  },
);
