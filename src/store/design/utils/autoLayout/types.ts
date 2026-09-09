// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect } from 'types/canvas';

export type TAutoLayoutSiblingPositionsInput = {
  alignment: AlignmentLayout;
  children: TAutoLayoutChildSize[];
  contentBox: TDraftRect;
  counterAxisSpacing: number;
  draggedSizes: TAutoLayoutChildSize[];
  index: number;
  itemSpacing: number;
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical;
};
