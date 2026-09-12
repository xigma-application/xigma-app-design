// store
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

// types
import { TAutoLayoutDropTargetHover, TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TDesignPage } from 'store/design/types';
import { TSceneNode } from 'types/design/types';

type TResolveDropTargetIndexParams = {
  autoLayoutDropTarget: TAutoLayoutDropTargetHover | null;
  gridAutoInsertIndex: number | null;
  matchingReorderPreview: TAutoLayoutReorderPreview | null;
  page: TDesignPage;
  targetFrame: TSceneNode | null;
  targetParentId: string | null;
};

export const resolveDropTargetIndex = ({
  autoLayoutDropTarget,
  gridAutoInsertIndex,
  matchingReorderPreview,
  page,
  targetFrame,
  targetParentId,
}: TResolveDropTargetIndexParams): number => {
  const targetContainer = targetFrame !== null && isContainerNode(targetFrame) ? targetFrame : null;
  const isAutoLayoutDrop = autoLayoutDropTarget !== null && autoLayoutDropTarget.frameId === targetParentId;

  switch (true) {
    case matchingReorderPreview !== null:
      return matchingReorderPreview!.activeIndex;
    case isAutoLayoutDrop:
      return autoLayoutDropTarget!.index;
    case gridAutoInsertIndex !== null:
      return gridAutoInsertIndex!;
    case targetContainer !== null:
      return targetContainer!.childIds.length;
    default:
      return page.rootOrder.length;
  }
};
