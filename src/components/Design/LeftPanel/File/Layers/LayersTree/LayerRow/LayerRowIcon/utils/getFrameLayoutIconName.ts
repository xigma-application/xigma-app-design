// @xigma
import { TIconProps } from '@xigma/components';

// types
import { LayoutMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

export const getFrameLayoutIconName = (node: TFrameNode): TIconProps['name'] | undefined => {
  switch (node.layoutMode) {
    case LayoutMode.vertical:
      return node.layoutWrap ? 'LayoutHorizontalWrap' : 'LayoutVertical';
    case LayoutMode.horizontal:
      return node.layoutWrap ? 'LayoutHorizontalWrap' : 'LayoutHorizontal';
    case LayoutMode.grid:
      return 'LayoutGrid';
    default:
      return undefined;
  }
};
