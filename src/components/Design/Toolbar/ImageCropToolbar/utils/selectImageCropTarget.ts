import { createSelector } from '@reduxjs/toolkit';

// store
import { selectImageEditor, selectNodes } from 'store/design/selectors';

// types
import { isAppearanceNode, TAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TImagePaint } from 'types/design/paint/types';

export type TImageCropTarget = {
  node: TAppearanceNode;
  paint: TImagePaint;
  paintIndex: number;
};

export const selectImageCropTarget = createSelector(
  [selectImageEditor, selectNodes],
  (imageEditor, nodes): TImageCropTarget | undefined => {
    if (imageEditor?.mode === 'crop') {
      const node = nodes[imageEditor.nodeId];

      if (isAppearanceNode(node)) {
        const paint = node.fills[imageEditor.paintIndex];

        if (paint?.type === 'image') {
          return { node, paint, paintIndex: imageEditor.paintIndex };
        }
      }
    }

    return undefined;
  },
);
