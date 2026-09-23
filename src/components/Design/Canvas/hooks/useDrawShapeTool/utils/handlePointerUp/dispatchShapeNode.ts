// store
import { addNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TNewNodeDropTarget } from 'components/Design/Canvas/utils/resolveNewNodeDropTarget/types';

// utils
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export const dispatchShapeNode = (
  dispatch: AppDispatch,
  rect: TDraftRect,
  fill: string,
  name: string,
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section,
  dropTarget: TNewNodeDropTarget | null,
): void => {
  const parentId = type === NodeType.section ? null : (dropTarget?.parentId ?? null);
  const targetIndex = type === NodeType.section ? undefined : dropTarget?.targetIndex;

  switch (type) {
    case NodeType.frame:
      dispatch(
        addNode(
          { ...rect, childIds: [], clipContent: true, fills: [makeSolidPaint(fill)], name, parentId, rotation: 0, type },
          targetIndex,
        ),
      );
      break;
    case NodeType.section:
      dispatch(addNode({ ...rect, childIds: [], fill, name, parentId, rotation: 0, type }));
      break;
    case NodeType.rectangle:
      dispatch(addNode({ ...rect, fills: [makeSolidPaint(fill)], name, parentId, rotation: 0, type }, targetIndex));
      break;
    default:
      dispatch(addNode({ ...rect, fill, name, parentId, rotation: 0, type }, targetIndex));
  }
};
