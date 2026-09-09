// store
import { TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';

// types
import { AlignmentLayout } from 'types/design/enums';
import {
  TAutoLayoutChildPosition,
  TAutoLayoutChildSize,
} from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export type TAutoLayoutDropTargetContext = {
  alignment: AlignmentLayout;
  counterAxisSpacing: number;
  draggedSizes: TAutoLayoutChildSize[];
  isSameParentReorder: boolean;
  isWrapEnabled: boolean;
  itemSpacing: number;
  orderedMovedIds: string[];
  originalIndex: number | null;
  padding: TAutoLayoutPadding;
  realPositions: TAutoLayoutChildPosition[];
  siblingEntries: { bounds: TDraftRect; sibling: TSceneNode }[];
  siblingSizes: TAutoLayoutChildSize[];
};
