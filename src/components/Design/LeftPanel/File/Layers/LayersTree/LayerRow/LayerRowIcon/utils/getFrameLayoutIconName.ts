// @xigma
import { TIconProps } from '@xigma/components';

// types
import { LayoutMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

export const getFrameLayoutIconName = (node: TFrameNode): TIconProps['name'] | undefined => {
  if (node.layoutMode === LayoutMode.vertical) {
    return 'LayoutVertical';
  }

  if (node.layoutMode === LayoutMode.horizontal) {
    return node.layoutWrap ? 'LayoutHorizontalWrap' : 'LayoutHorizontal';
  }

  if (node.layoutMode === LayoutMode.grid) {
    return 'LayoutGrid';
  }

  return undefined;
};
