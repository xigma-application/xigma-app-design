import { createSelector } from '@reduxjs/toolkit';

// store
import { selectImageEditor, selectNodes } from 'store/design/selectors';

// types
import { isAppearanceNode, TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint, TVideoPaint } from 'types/design/paint/types';

// utils
import { getNodePaints } from 'utils/design/paint/getNodePaints';

export type TImageCropTarget = {
  node: TAppearanceNode;
  paint: TImagePaint | TVideoPaint;
  paintIndex: number;
};

export const selectImageCropTarget = createSelector(
  [selectImageEditor, selectNodes],
  (imageEditor, nodes): TImageCropTarget | undefined => {
    if (imageEditor?.mode === 'crop' && (imageEditor.property ?? 'fills') === 'fills') {
      const node = nodes[imageEditor.nodeId];

      if (isAppearanceNode(node)) {
        const paint = getNodePaints(node, imageEditor.property)[imageEditor.paintIndex];

        if (paint?.type === 'image' || paint?.type === 'video') {
          return { node, paint, paintIndex: imageEditor.paintIndex };
        }
      }
    }

    return undefined;
  },
);
